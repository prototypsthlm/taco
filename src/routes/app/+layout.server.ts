import { getUserChats } from '$lib/server/entities/chat'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const chats = await getUserChats(locals.currentUser.id)

  return {
    user: locals.currentUser,
    chats,
  }
}
