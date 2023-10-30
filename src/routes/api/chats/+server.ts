import {
  countMessagesTokens,
  decryptApiKey,
  generateChatName,
  getModelSettings,
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
import { Models } from '$lib/types/models'
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
      model: z.union([z.literal(Models.gpt3), z.literal(Models.gpt4)]),
      temperature: z
        .number()
        .refine(value => 0 <= value && value <= 2, {
          message: "Temperature must be a number between 0 and 2 (inclusive)",
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


  if (!chat?.owner?.team?.openAiApiKey) {
    throw error(
      500,
      JSON.stringify({
        title: 'No api key',
      })
    )
  }

  const chatRequest = retryWithExponentialBackoff(async () => {
    return fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        Authorization: `Bearer ${decryptApiKey(chat?.owner?.team?.openAiApiKey)}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(chatRequestBody),
    })
  })

  const inputTokenCount = countMessagesTokens(chatRequestBody.messages)
  const newQuestionTokenCount = countTokens(`"user": "${schema.data.question}"`)
  const modelSettings = getModelSettings(schema.data.model)
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

      const readAndEnqueue = async () => {
        try {
          if (!chatResponseReader) return

          const { value, done } = await chatResponseReader.read()

          if (done) {
            controller.close()
            return
          }

          const dataArray = decodeChunkData(value)

          const modifiedDataArray = (
            await Promise.all(
              dataArray.map(async (data) => {
                if (data === '[DONE]') {
                  if (lastMessage?.answer) {
                    await storeAnswer(lastMessage.id, lastMessage.answer)
                  }
                  return JSON.stringify({ state: 'DONE' })
                }

                const parsedData = JSON.parse(data)
                const delta = extractDelta(parsedData)
                if (!delta) {
                  return null
                }
                lastMessage.answer! += delta

                return JSON.stringify({ state: 'PROCESSING', delta })
              })
            )
          ).filter((x) => x !== null) as string[]

          controller.enqueue(encodeChunkData(modifiedDataArray))
        } catch (e) {
          Sentry.captureException(error)
          controller.enqueue(
            encodeChunkData([
              JSON.stringify({ state: 'ERROR', title: 'Request Error', body: error }),
            ])
          )
          controller.close()
        }

        await readAndEnqueue()
      }

      await readAndEnqueue()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
}
