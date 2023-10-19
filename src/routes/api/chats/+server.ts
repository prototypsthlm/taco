import {
  generateChatName,
  getApiKey,
  getModelSettings,
  transformChatToCompletionRequest,
} from '$lib/server/api/openai'
import {
  addQuestionToChat,
  type ChatWithRelations,
  countChatInputTokens,
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
  console.time('countGeneral')
  // This is called from the 'eventSource = new SSE' in the 'handleSubmit' function in 'ChatRoom.svelte'.
  const requestData = await request.json()

  const schema = z
    .object({
      id: z.union([z.preprocess(Number, z.number()), z.undefined()]),
      role: z.union([z.string(), z.undefined()]),
      question: z.string(),
      model: z.union([z.literal(Models.gpt3), z.literal(Models.gpt4)]),
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
    generateChatName(chat, schema.data.model)
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
    schema.data.question,
    true
  ) // This is the request body that will be sent to the openAI API.
  const chatRequest = fetch('https://api.openai.com/v1/chat/completions', {
    // This is the final request that will be sent to the openAI API.
    headers: {
      Authorization: `Bearer ${getApiKey(chat)}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(chatRequestBody),
  })

  const messagesTokenCount = await countChatInputTokens(chat)
  console.log({ messagesTokenCount })
  const questionTokenCount = countTokens(schema.data.question) || 0
  console.log({ questionTokenCount })
  const inputTokenCount = messagesTokenCount + questionTokenCount
  const modelSettings = getModelSettings(schema.data.model)
  const tokenLimit = modelSettings.maxTokens - modelSettings.outputRoom
  console.log({ inputTokenCount, tokenLimit })

  if (inputTokenCount > tokenLimit) {
    throw error(
      422,
      JSON.stringify({
        title: `Token Limit Exceeded`,
        body: `Current token limit is ${tokenLimit} tokens. Please reduce the length of your next question (currently: ${questionTokenCount} tokens) or remove some previous messages (currently: ${messagesTokenCount} tokens).`,
      })
    )
  }

  const stream = new ReadableStream({
    async start(controller) {
      chat = await addQuestionToChat(
        chat.id,
        schema.data.model,
        schema.data.question,
        currentUser.id
      ) // We save the question (request + response) in the chat.
      const lastMessage = chat.messages[chat.messages.length - 1]
      lastMessage.answer = ''

      controller.enqueue(encodeChunkData([JSON.stringify({ initial: true, chat })]))

      const chatResponse = await chatRequest

      if (!chatResponse.ok || !chatResponse.body) {
        const err = await chatResponse.json()
        throw error(500, JSON.stringify({ error: `OpenAI API Error: ${err.error.message}` }))
      }

      const chatResponseReader = chatResponse.body?.getReader()

      const readAndEnqueue = async () => {
        if (!chatResponseReader) return

        const { value, done } = await chatResponseReader.read()

        if (done) {
          controller.close()
          return
        }

        try {
          const dataArray = decodeChunkData(value)

          const modifiedDataArray = (
            await Promise.all(
              dataArray.map(async (data) => {
                console.log(data)
                if (data === '[DONE]') {
                  if (lastMessage?.answer) {
                    await storeAnswer(lastMessage.id, lastMessage.answer)
                  }
                  return JSON.stringify({ final: true })
                }

                const parsedData = JSON.parse(data)
                const delta = extractDelta(parsedData)
                if (!delta) {
                  return null
                }
                lastMessage.answer! += delta

                return JSON.stringify({ during: true, delta })
              })
            )
          ).filter((x) => x !== null) as string[]

          controller.enqueue(encodeChunkData(modifiedDataArray))
        } catch (e) {
          Sentry.captureException(error)
          controller.enqueue(value)
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
