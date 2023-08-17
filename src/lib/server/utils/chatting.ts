import { ask, generateChatName } from '$lib/server/api/openai'
import { storeError, type ChatWithRelations } from '$lib/server/entities/chat'
import {
  addMessageToChat,
  createChat,
  getChatWithRelationsById,
  setChatName,
  storeAnswer,
} from '$lib/server/entities/chat'
import { getUserWithActiveUserTeamById } from '$lib/server/entities/user'
import { trim } from '$lib/utils/string'
import type { User } from '@prisma/client'
import { z, ZodError } from 'zod'

export async function sendMessage(formData: unknown, user: User) {
  try {
    const schema = z
      .object({
        message: z.string(),
        chatId: z.union([z.string(), z.undefined()]),
        role: z.union([z.string(), z.undefined()]),
      })
      .parse(formData)

    let chat: ChatWithRelations
    const userWithActiveUserTeam = await getUserWithActiveUserTeamById(user.id)
    if (schema.chatId === undefined) {
      if (!userWithActiveUserTeam.activeUserTeamId) throw new Error('User has no active team')
      chat = await createChat(userWithActiveUserTeam.activeUserTeamId, schema.role)
    } else {
      const chatId = Number(schema.chatId)
      chat = await getChatWithRelationsById(chatId)
    }

    try {
      if (!chat.name && chat.messages.some((x) => x.answer)) {
        let name = await generateChatName(chat)
        name = trim(name, '"').trim()
        name = trim(name, '.').trim()
        name = trim(name, 'Topic:').trim()
        chat = await setChatName(chat.id, name)
      }
    } catch (e) {
      console.error(`something went south ${e}`)
    }

    chat = await addMessageToChat(chat, schema.message)
    try {
      const llmResponse = await ask(chat)
      const lastMessage = chat.messages[chat.messages.length - 1]
      await storeAnswer(lastMessage.id, llmResponse)
      chat = await getChatWithRelationsById(chat.id)

      return {
        chat,
      }
    } catch (e) {
      const lastMessage = chat.messages[chat.messages.length - 1]
      await storeError(lastMessage.id, e.message)
      chat = await getChatWithRelationsById(chat.id)

      return {
        chat,
      }
    }
  } catch (error) {
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
