import {
  getUserWithUserTeamsActiveTeamAndChatsById,
  isUserVerified,
  markVerifyUserNotificationAsUnread,
} from '$lib/server/entities/user'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ url, locals: { currentUser } }) => {
  if (!(await isUserVerified(currentUser.id))) {
    await markVerifyUserNotificationAsUnread(currentUser.id)
  }

  const userWithActiveTeamAndChats = await getUserWithUserTeamsActiveTeamAndChatsById(
    currentUser.id
  )

  if (!currentUser.activeUserTeamId && !url.pathname.startsWith('/app/settings/teams')) {
    // no active team -> force team selection
    throw redirect(303, '/app/settings/teams')
  }

  return {
    user: userWithActiveTeamAndChats,
  }
}
