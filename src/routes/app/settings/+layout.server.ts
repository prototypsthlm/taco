import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals, parent }) => {
  const { chats } = await parent()
  return {
    user: locals.currentUser,
    chats,
  }
}
