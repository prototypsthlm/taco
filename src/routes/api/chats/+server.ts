import {
  generateChatName,
  getApiKey,
  transformChatToCompletionRequest,
} from '$lib/server/api/openai'
import type { ChatWithRelations } from '$lib/server/entities/chat'
import { createChat, createMessage, getChatWithRelationsById } from '$lib/server/entities/chat'
import { decodeChunkData, encodeChunkData } from '$lib/utils/stream'
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

  const chatRequest = transformChatToCompletionRequest(chat, schema.data.question, true)

  const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      Authorization: `Bearer ${getApiKey(chat)}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(chatRequest),
  })

  if (!chatResponse.ok || !chatResponse.body) {
    const err = await chatResponse.json()
    throw error(500, JSON.stringify({ error: `OpenAI API Error: ${err.error.message}` }))
  }

  let answer = ''
  const { readable, writable } = new TransformStream({
    async transform(chunk, controller) {
      try {
        const dataArray = decodeChunkData(chunk)

        const modifiedDataArray = await Promise.all(
          dataArray.map(async (data) => {
            if (data === '[DONE]') {
              await createMessage(chat.id, schema.data.question, answer)
              return `${data} {"chatId": ${chat.id}}`
            }

            const parsedData = JSON.parse(data)
            const [{ delta }] = parsedData.choices

            if (delta?.content) {
              answer += delta.content
            }
            return JSON.stringify({ ...parsedData, chatId: chat.id })
          })
        )

        controller.enqueue(encodeChunkData(modifiedDataArray))
      } catch (e) {
        console.error(`Streaming Error: ${e}`)
        controller.enqueue(chunk)
      }
    },
  })

  chatResponse.body.pipeThrough({ writable, readable })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
}
