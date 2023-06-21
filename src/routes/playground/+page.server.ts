import { ask } from '$lib/api/openai'
import {
  addMessageToChat,
  getChatWithRelationsById,
  getUserChats,
  storeAnswer,
} from '$lib/entities/chat'
import { fail, json, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const userChats = await getUserChats(locals.currentUser.id)

  return {
    chat: {
      ...userChats[0],
      temperature: Number(userChats[0].temperature),
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

      const chatWithQuestion = await addMessageToChat(userChats[0], schema.message)

      try {
        const maybeResponse = await ask(chatWithQuestion)

        if (maybeResponse) {
          const lastMessage = chatWithQuestion.messages[chatWithQuestion.messages.length - 1]

          await storeAnswer(lastMessage.id, maybeResponse)

          const updatedChat = await getChatWithRelationsById(chatWithQuestion.id)

          if (!updatedChat) {
            return fail(500, { error: 'very very bad.' })
          }

          return {
            chat: {
              ...updatedChat,
              temperature: Number(updatedChat.temperature),
            },
          }
        }
      } catch (e) {
        console.log({ e })
        return fail(500, { error: 'very bad.' })
      }
    } catch (error) {
      console.log({ error })
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

    throw redirect(303, '/app')
  },
}
