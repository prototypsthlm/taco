import { ask } from '$lib/api/openai'
import { addMessageToChat, getChatWithRelationsById, storeAnswer } from '$lib/entities/chat'
import { fail, type Actions } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const chatId = Number(params.chatId)
  const chat = await getChatWithRelationsById(chatId)

  return {
    chatId,
    chat: {
      ...chat,
      temperature: String(chat?.temperature),
    },
  }
}

export const actions: Actions = {
  sendMessage: async ({ request, params }) => {
    const chatId = Number(params.chatId)
    const data = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          message: z.string(),
        })
        .parse(data)

      const chat = await getChatWithRelationsById(chatId)
      const chatWithQuestion = await addMessageToChat(chat, schema.message)
      const llmResponse = await ask(chatWithQuestion)

      const lastMessage = chatWithQuestion.messages[chatWithQuestion.messages.length - 1]
      await storeAnswer(lastMessage.id, llmResponse)
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

  fetchFirstAnswer: async ({ params }) => {
    const chatId = Number(params.chatId)
    const chat = await getChatWithRelationsById(chatId)

    if (chat?.messages.length === 1 && chat.messages[0].answer === null) {
      const response = await ask(chat)

      const lastMessage = chat.messages[0]
      await storeAnswer(lastMessage.id, response)

      const updatedChat = await getChatWithRelationsById(chatId)

      return {
        ...updatedChat,
        temperature: Number(updatedChat?.temperature),
      }
    } else {
      return null
    }
  },
}
