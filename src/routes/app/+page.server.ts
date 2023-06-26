import { ask } from '$lib/api/openai'
import {
  addMessageToChat,
  createChat,
  getChatWithRelationsById,
  storeAnswer,
} from '$lib/entities/chat'
import type { Chat } from '@prisma/client'
import { fail } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions } from './$types'

export const actions: Actions = {
  sendMessage: async ({ request, locals }) => {
    const data = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          message: z.string(),
          chatId: z.union([z.string(), z.undefined()]),
        })
        .parse(data)

      let chat: Chat
      if (schema.chatId === undefined) {
        chat = await createChat(locals.currentUser.id)
      } else {
        const chatId = Number(schema.chatId)
        chat = await getChatWithRelationsById(chatId)
      }

      const chatWithQuestion = await addMessageToChat(chat, schema.message)
      const llmResponse = await ask(chatWithQuestion)

      const lastMessage = chatWithQuestion.messages[chatWithQuestion.messages.length - 1]
      await storeAnswer(lastMessage.id, llmResponse)
      const updatedChat = await getChatWithRelationsById(chatWithQuestion.id)

      console.log({
        ...updatedChat,
        temperature: Number(updatedChat?.temperature),
      })

      return {
        chat: {
          ...updatedChat,
          temperature: Number(updatedChat?.temperature),
        },
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
