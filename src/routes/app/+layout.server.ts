import { getUserChats } from '$lib/entities/chat'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const chats = await getUserChats(locals.currentUser.id)

  return {
    user: locals.currentUser,
    chats: chats.map((chat) => ({
      ...chat,
      temperature: Number(chat?.temperature),
    })),
  }
}
