import { getUserWithUserTeamsActiveTeamAndChatsById } from '$lib/server/entities/user'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const userWithRelations = await getUserWithUserTeamsActiveTeamAndChatsById(locals.currentUser.id)
  return {
    user: userWithRelations,
  }
}
