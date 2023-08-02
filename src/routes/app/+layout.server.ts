import { getUserWithUserTeamsActiveTeamAndChatsById } from '$lib/server/entities/user'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { currentUser } }) => {
  const userWithActiveTeamAndChats = await getUserWithUserTeamsActiveTeamAndChatsById(
    currentUser.id
  )

  return {
    user: userWithActiveTeamAndChats,
  }
}
