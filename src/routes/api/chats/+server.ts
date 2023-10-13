import {
  generateChatName,
  getApiKey,
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
import { Models } from '$lib/types/models'

export const POST: RequestHandler = async ({ request, fetch, locals: { currentUser } }) => {
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
  const givenModel = schema.data.model

  if (schema.data.id) {
    try {
      chat = await getChatWithRelationsById(schema.data.id)
      await generateChatName(chat, givenModel)
    } catch (e) {
      throw error(500, JSON.stringify({ error: `Error getting chat ${e}` }))
    }
  } else {
    if (!currentUser.activeUserTeamId) {
      throw error(500, JSON.stringify({ error: `User has no active team` }))
    }
    chat = await createChat(currentUser.activeUserTeamId, schema.data.role)
  }

  const chatRequestBody = transformChatToCompletionRequest(
    chat,
    givenModel,
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

  const stream = new ReadableStream({
    async start(controller) {
      chat = await addQuestionToChat(chat.id, givenModel, schema.data.question, currentUser.id) // We save the question (request + response) in the chat.
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
                if (data === '[DONE]') {
                  if (lastMessage?.answer) {
                    await storeAnswer(
                      lastMessage.id,
                      lastMessage.answer,
                      lastMessage.tokenCount || 0
                    )
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

        // controller.enqueue(value)
        await readAndEnqueue()
      }

      // Initiate the reading/enqueueing
      await readAndEnqueue()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
}
