import {
  generateChatName,
  getApiKey,
  transformChatToCompletionRequest,
} from '$lib/server/api/openai'
import type { ChatWithRelations } from '$lib/server/entities/chat'
import {
  addQuestionToChat,
  createChat,
  getChatWithRelationsById,
  storeAnswer,
} from '$lib/server/entities/chat'
import { decodeChunkData, encodeChunkData, extractDelta } from '$lib/utils/stream'
import { error } from '@sveltejs/kit'
import { z } from 'zod'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, fetch, locals: { currentUser } }) => {
  const requestData = await request.json()

  const schema = z
    .object({
      id: z.union([z.preprocess(Number, z.number()), z.undefined()]),
      role: z.union([z.string(), z.undefined()]),
      question: z.string(),
    })
    .safeParse(requestData)

  if (!schema.success) {
    throw error(422, JSON.stringify({ errors: schema.error.flatten().fieldErrors }))
  }

  let chat: ChatWithRelations

  if (schema.data.id) {
    try {
      chat = await getChatWithRelationsById(schema.data.id)
      generateChatName(chat)
    } catch (e) {
      throw error(500, JSON.stringify({ error: `Error getting chat ${e}` }))
    }
  } else {
    if (!currentUser.activeUserTeamId) {
      throw error(500, JSON.stringify({ error: `User has no active team` }))
    }
    chat = await createChat(currentUser.activeUserTeamId, schema.data.role)
  }

  const chatRequestBody = transformChatToCompletionRequest(chat, schema.data.question, true)
  const chatRequest = fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      Authorization: `Bearer ${getApiKey(chat)}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(chatRequestBody),
  })

  const stream = new ReadableStream({
    async start(controller) {
      chat = await addQuestionToChat(chat.id, schema.data.question, currentUser.id)
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

          const modifiedDataArray = await Promise.all(
            dataArray.map(async (data) => {
              if (data === '[DONE]') {
                if (lastMessage?.answer) {
                  await storeAnswer(lastMessage.id, lastMessage.answer)
                }
                return `${JSON.stringify({ final: true })}`
              }

              const parsedData = JSON.parse(data)
              const delta = extractDelta(parsedData)
              lastMessage.answer! += delta

              return JSON.stringify({ during: true, delta })
            })
          )

          controller.enqueue(encodeChunkData(modifiedDataArray))
        } catch (e) {
          console.error(`Streaming Error: ${e}`)
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
