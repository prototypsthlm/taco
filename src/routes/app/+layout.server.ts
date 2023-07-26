import { getUserTeamChats } from '$lib/server/entities/chat'
import { findAllTeamsFromUser } from '$lib/server/entities/user'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const activeTeamId = locals.currentUser.activeTeamId
  const userId = locals.currentUser.id
  const userTeams = await findAllTeamsFromUser(userId)
  let chats = null

  if (activeTeamId) {
    chats = await getUserTeamChats(userId, activeTeamId)
  }

  return {
    user: locals.currentUser,
    chats,
    teams: userTeams,
    currentTeam: userTeams?.find((x) => x.id === activeTeamId),
  }
}
