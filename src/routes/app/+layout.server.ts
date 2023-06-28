import { getUserChats } from '$lib/entities/chat'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  let chats = await getUserChats(locals.currentUser.id)

  return {
    chats: chats.map((chat) => ({
      ...chat,
      temperature: String(chat?.temperature),
    })),
  }
}
