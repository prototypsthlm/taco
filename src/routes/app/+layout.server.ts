import { getUserTeamChats } from '$lib/server/entities/chat'
import { findAllTeamsFromUser } from '$lib/server/entities/user'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const activeTeam = locals.currentUser.activeTeamId
  const userId = locals.currentUser.id
  const userTeams = findAllTeamsFromUser(userId)

  if (!activeTeam) {
    return {
      user: locals.currentUser,
      chats: null,
      teams: userTeams,
    }
  }

  const chats = await getUserTeamChats(userId, activeTeam)

  return {
    user: locals.currentUser,
    chats,
    teams: userTeams,
  }
}
