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
import { Models } from '$lib/types/models'

export const POST: RequestHandler = async ({ request, fetch, locals: { currentUser } }) => {
  // This is called from the 'eventSource = new SSE' in the 'handleSubmit' function in 'ChatRoom.svelte'.
  const requestData = await request.json()

  const schema = z
    .object({
      id: z.union([z.preprocess(Number, z.number()), z.undefined()]),
      role: z.union([z.string(), z.undefined()]),
      question: z.string(),
      model: z.union([
        z.literal(Models.gpt3),
        z.literal(Models.gpt4),
      ]),
    })
    .safeParse(requestData)

  if (!schema.success) {
    throw error(422, JSON.stringify({ errors: schema.error.flatten().fieldErrors }))
  }

  let chat: ChatWithRelations
  const givenModel = schema.data.model;

  if (schema.data.id) {
    try {
      chat = await getChatWithRelationsById(schema.data.id)
      generateChatName(chat, givenModel)
    } catch (e) {
      throw error(500, JSON.stringify({ error: `Error getting chat ${e}` }))
    }
  } else {
    if (!currentUser.activeUserTeamId) {
      throw error(500, JSON.stringify({ error: `User has no active team` }))
    }
    chat = await createChat(currentUser.activeUserTeamId, schema.data.role)
  }

  let chatRequest: any;
  let chatResponse: any;

  if (givenModel.includes("gpt")) {
    // Using ChatGPT (OpenAI API).

    chatRequest = transformChatToCompletionRequest(chat, givenModel, schema.data.question, true) // This is the final request that will be sent to the openAI API.
    chatResponse = await fetch('https://api.openai.com/v1/chat/completions', { // This is the actual query to the openAI API.
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
  }

  // TO DO: If no model from givenModel could be found, return an error.

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encodeChunkData([JSON.stringify({ chat })]))

      const chatResponseReader = chatResponse.body?.getReader()
      console.log("   --->>>   chatResponseReader:\n" + chatResponse);
      chat = await addQuestionToChat(chat.id, givenModel, schema.data.question) // We save the question (request + response) in the chat.
      const lastMessage = chat.messages[chat.messages.length - 1]
      lastMessage.answer = ''
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
                return `[DONE] ${JSON.stringify({ chat })}`
              }

              const parsedData = JSON.parse(data)
              lastMessage.answer! += extractDelta(parsedData)

              return JSON.stringify({ chat })
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
