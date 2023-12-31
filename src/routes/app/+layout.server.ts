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

  if (!currentUser.activeUserTeamId && !url.pathname.startsWith('/app/settings')) {
    // no active team -> force team selection
    throw redirect(303, '/app/settings/teams')
  }

  return {
    user: getUserWithUserTeamsActiveTeamAndChatsById(currentUser.id),
  }
}
