import {
  countMessagesTokens,
  decryptApiKey,
  generateChatName,
  getModel,
  MODELS,
  retryWithExponentialBackoff,
  transformChatToCompletionRequest,
} from '$lib/server/api/openai'
import {
  addQuestionToChat,
  type ChatWithRelations,
  createChat,
  getChatWithRelationsById,
  storeAnswer,
} from '$lib/server/entities/chat'
import { countTokens } from '$lib/server/utils/tokenizer'
import { decodeChunkData, encodeChunkData, extractDelta } from '$lib/utils/stream'
import * as Sentry from '@sentry/sveltekit'
import { error } from '@sveltejs/kit'
import { z } from 'zod'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, fetch, locals: { currentUser } }) => {
  // This is called from the 'eventSource = new SSE' in the 'handleSubmit' function in 'ChatRoom.svelte'.
  const requestData = await request.json()

  const schema = z
    .object({
      id: z.union([z.preprocess(Number, z.number()), z.undefined()]),
      role: z.union([z.string(), z.undefined()]),
      question: z.string(),
      model: z.string().min(1),
      temperature: z.number().refine((value) => 0 <= value && value <= 2, {
        message: 'Temperature must be a number between 0 and 2 (inclusive)',
      }),
    })
    .safeParse(requestData)

  if (!schema.success) {
    throw error(422, JSON.stringify({ errors: schema.error.flatten().fieldErrors }))
  }

  let chat: ChatWithRelations

  if (schema.data.id) {
    try {
      chat = await getChatWithRelationsById(schema.data.id)
    } catch (e) {
      throw error(
        500,
        JSON.stringify({
          title: 'There was a problem reading the chat',
          body: 'Please try again later.',
        })
      )
    }
    generateChatName(chat, schema.data.model, schema.data.temperature)
  } else {
    if (!currentUser.activeUserTeamId) {
      throw error(
        500,
        JSON.stringify({
          title: 'User has no active team',
        })
      )
    }
    chat = await createChat(currentUser.activeUserTeamId, schema.data.role)
  }

  const chatRequestBody = transformChatToCompletionRequest(
    chat,
    schema.data.model,
    schema.data.temperature,
    schema.data.question,
    true
  ) // This is the request body that will be sent to the openAI API.

  const openAiApiKey = chat?.owner?.team?.openAiApiKey
  if (!openAiApiKey) {
    throw error(
      500,
      JSON.stringify({
        title: 'No api key',
      })
    )
  }

  const chatRequest = retryWithExponentialBackoff(async () => {
    const isOpenAiModel = !!MODELS.find((model) => {
      return model.id === schema.data.model
    })

    if (!currentUser.activeUserTeam) {
      throw error(
        422,
        JSON.stringify({
          title: `User needs an active team`,
          body: `Please select an active team`,
        })
      )
    }

    const apiUrl = isOpenAiModel
      ? 'https://api.openai.com'
      : `${currentUser.activeUserTeam?.team.ollamaBaseUrl}`

    return fetch(`${apiUrl}/v1/chat/completions`, {
      headers: {
        Authorization: `Bearer ${decryptApiKey(openAiApiKey)}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(chatRequestBody),
    })
  })

  const inputTokenCount = countMessagesTokens(chatRequestBody.messages)
  const newQuestionTokenCount = countTokens(`"user": "${schema.data.question}"`)
  const modelSettings = getModel(schema.data.model)

  if (modelSettings) {
    const tokenLimit = modelSettings.maxTokens - modelSettings.outputRoom

    if (inputTokenCount > tokenLimit) {
      throw error(
        422,
        JSON.stringify({
          title: `Token Limit of Exceeded`,
          body: `Current messages are ${inputTokenCount} tokens and the limit is ${tokenLimit} tokens. Please reduce the length of your next question (${newQuestionTokenCount} tokens) or remove some previous messages.`,
        })
      )
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      chat = await addQuestionToChat(
        chat.id,
        schema.data.model,
        schema.data.temperature,
        schema.data.question,
        currentUser.id
      ) // We save the question (request + response) in the chat.
      const lastMessage = chat.messages[chat.messages.length - 1]
      lastMessage.answer = ''
      controller.enqueue(encodeChunkData([JSON.stringify({ state: 'INITIAL', chat })]))

      const chatResponse = await chatRequest()

      if (!chatResponse.ok) {
        const json = await chatResponse.json()
        controller.enqueue(
          encodeChunkData([
            JSON.stringify({ state: 'ERROR', title: 'Request Error', body: json?.error?.message }),
          ])
        )
        controller.close()
        Sentry.captureException('Request Error', json)
        return
      }

      const chatResponseReader = chatResponse.body?.getReader()

      async function procStream(
        reader: ReadableStreamDefaultReader<Uint8Array>,
        previousData = ''
      ) {
        try {
          const { value, done } = await reader.read()

          if (done) {
            controller.close()
            return
          }

          const combinedData = previousData + new TextDecoder().decode(value)
          const parts = combinedData.split('\n\n')
          const completeParts = parts.slice(0, -1)
          const incompletePart = parts[parts.length - 1]

          for (const part of completeParts) {
            if (part.startsWith('data: ')) {
              const dataArray = decodeChunkData(new TextEncoder().encode(part))
              const modifiedDataArray = (
                await Promise.all(
                  dataArray.map(async (data) => {
                    if (data === '[DONE]') {
                      return JSON.stringify({ state: 'DONE' })
                    }

                    const parsedData = JSON.parse(data)
                    const delta = extractDelta(parsedData)
                    if (!delta) {
                      return null
                    }
                    lastMessage.answer! += delta

                    if (lastMessage?.answer) {
                      // We store the answer every time we get an update, we deliberately
                      // do not wait for it to be completed so if the message is cancelled,
                      // the part of the answer that took time enough to be generated is
                      // stored either.
                      await storeAnswer(lastMessage.id, lastMessage.answer)
                    }

                    return JSON.stringify({ state: 'PROCESSING', delta })
                  })
                )
              ).filter((x) => x !== null) as string[]
              controller.enqueue(encodeChunkData(modifiedDataArray))
            }
          }

          await procStream(reader, incompletePart)
        } catch (error) {
          Sentry.captureException(error)
          controller.error(error)
        }
      }

      if (chatResponseReader) {
        await procStream(chatResponseReader)
      } else {
        // Handle the case where chatResponseReader is not available
        controller.close()
      }
    },
    async cancel(controller) {
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
}
