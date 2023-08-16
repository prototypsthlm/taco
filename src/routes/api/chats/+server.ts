import { transformChatToCompletionRequest } from '$lib/server/api/openai'
import { createChat, getChatWithRelationsById } from '$lib/server/entities/chat'
import type { ChatWithRelations } from '$lib/server/entities/chat'
import { decrypt } from '$lib/server/utils/crypto'
import { error, json } from '@sveltejs/kit'
import { PassThrough } from 'stream'
import { z } from 'zod'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, request, fetch, locals: { currentUser } }) => {
  const requestData = await request.json()

  const schema = z
    .object({
      id: z.union([z.preprocess(Number, z.number()), z.undefined()]),
      role: z.union([z.string(), z.undefined()]),
      question: z.string(),
    })
    .safeParse(requestData)

  if (!schema.success) {
    throw error(422, json({ errors: schema.error.flatten().fieldErrors }))
  }

  let chat: ChatWithRelations

  if (schema.data.id) {
    try {
      chat = await getChatWithRelationsById(schema.data.id)
    } catch (e) {
      throw error(500, json({ error: `Error getting user ${e}` }))
    }
  } else {
    if (!currentUser.activeUserTeamId) {
      throw error(500, json({ error: `User has no active team` }))
    }
    chat = await createChat(currentUser.activeUserTeamId, schema.data.role)
  }

  const chatRequest = transformChatToCompletionRequest(chat, schema.data.question, true)

  if (!chat?.owner?.team?.openAiApiKey) {
    throw error(500, json({ error: `Open AI API key is not set!` }))
  }

  if (!process.env.SECRET_KEY) {
    throw error(500, json({ error: `You must have SECRET_KEY set in your env.` }))
  }

  const apiKey = decrypt(chat.owner.team.openAiApiKey, process.env.SECRET_KEY)

  const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(chatRequest),
  })

  if (!chatResponse.ok) {
    const err = await chatResponse.json()
    throw error(500, json({ error: `OpenAI API Error: ${err.error.message}` }))
  }

  console.log(chatResponse)

  return new Response(chatResponse.body, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
}
