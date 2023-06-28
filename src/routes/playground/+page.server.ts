import { ask } from '$lib/api/openai'
import {
  addMessageToChat,
  createChat,
  getChatWithRelationsById,
  getUserChats,
  storeAnswer,
} from '$lib/entities/chat'
import type { Chat } from '@prisma/client'
import { fail, json, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const userChats = await getUserChats(locals.currentUser.id)

  return {
    chat: {
      ...userChats[0],
      temperature: Number(userChats[0]?.temperature),
    },
  }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          message: z.string(),
        })
        .parse(data)

      const userChats = await getUserChats(locals.currentUser.id)

      let currentChat: Chat = userChats[0]

      if (!currentChat) currentChat = await createChat(locals.currentUser.id)

      const chatWithQuestion = await addMessageToChat(currentChat, schema.message)

      const response = await ask(chatWithQuestion)

      const lastMessage = chatWithQuestion.messages[chatWithQuestion.messages.length - 1]

      await storeAnswer(lastMessage.id, response)

      const updatedChat = await getChatWithRelationsById(chatWithQuestion.id)

      return {
        ...updatedChat,
        temperature: Number(updatedChat?.temperature),
      }
    } catch (error) {
      console.error(error)
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          data,
          errors,
        })
      }

      return fail(500, {
        data,
        error,
      })
    }
  },
}
