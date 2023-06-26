import { getChatWithRelationsById } from '$lib/entities/chat'
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
