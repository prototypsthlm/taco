import { ask, generateChatName } from '$lib/server/api/openai'
import type { ChatWithRelations } from '$lib/server/entities/chat'
import {
  addMessageToChat,
  createChat,
  getChatWithRelationsById,
  setChatName,
  storeAnswer,
} from '$lib/server/entities/chat'
import { z, ZodError } from 'zod'

export async function sendMessage(formData: unknown, userId: number) {
  try {
    const schema = z
      .object({
        message: z.string(),
        chatId: z.union([z.string(), z.undefined()]),
      })
      .parse(formData)

    let chat: ChatWithRelations
    if (schema.chatId === undefined) {
      chat = await createChat(userId)
    } else {
      const chatId = Number(schema.chatId)
      chat = await getChatWithRelationsById(chatId)
    }

    try {
      if (!chat.name && chat.messages.some((x) => x.answer)) {
        const name = await generateChatName(chat)
        chat = await setChatName(chat.id, name)
      }
    } catch (e) {
      console.error(`something went south ${e}`)
    }

    chat = await addMessageToChat(chat, schema.message)
    const llmResponse = await ask(chat)

    const lastMessage = chat.messages[chat.messages.length - 1]
    await storeAnswer(lastMessage.id, llmResponse)
    chat = await getChatWithRelationsById(chat.id)

    return {
      chat,
    }
  } catch (error) {
    console.error(error)
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors

      return {
        error: {
          httpStatusCode: 422,
          data: formData,
          errors: errors,
        },
      }
    }

    return {
      error: {
        httpStatusCode: 500,
        data: formData,
        error: `${error}`,
      },
    }
  }
}
