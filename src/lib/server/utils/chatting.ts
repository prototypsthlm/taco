import { ask } from '$lib/server/api/openai'
import {
  addMessageToChat,
  createChat,
  getChatWithRelationsById,
  storeAnswer,
} from '$lib/server/entities/chat'
import type { Chat } from '@prisma/client'
import { z, ZodError } from 'zod'

export async function sendMessage(formData: any, userId: number) {
  try {
    const schema = z
      .object({
        message: z.string(),
        chatId: z.union([z.string(), z.undefined()]),
      })
      .parse(formData)

    let chat: Chat
    if (schema.chatId === undefined) {
      chat = await createChat(userId)
    } else {
      const chatId = Number(schema.chatId)
      chat = await getChatWithRelationsById(chatId)
    }

    const chatWithQuestion = await addMessageToChat(chat, schema.message)
    const llmResponse = await ask(chatWithQuestion)

    const lastMessage = chatWithQuestion.messages[chatWithQuestion.messages.length - 1]
    await storeAnswer(lastMessage.id, llmResponse)
    const updatedChat = await getChatWithRelationsById(chatWithQuestion.id)

    return {
      data: {
        ...updatedChat,
        temperature: Number(updatedChat?.temperature),
      },
    }
  } catch (error) {
    console.error(error)
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors

      return {
        error: {
          httpStatusCode: 422,
          data: formData,
          error: errors,
        },
      }
    }

    return {
      error: {
        httpStatusCode: 500,
        data: formData,
        error,
      },
    }
  }
}
