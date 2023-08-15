import {
  changeActiveUserTeam,
  getUserWithUserTeamsActiveTeamAndChatsById,
  getUserWithUserTeamsById,
} from '$lib/server/entities/user'
import { fail, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const userWithRelations = await getUserWithUserTeamsActiveTeamAndChatsById(locals.currentUser.id)
  return {
    user: userWithRelations,
  }
}

export const actions: Actions = {
  selectTeam: async ({ request, locals }) => {
    const data = Object.fromEntries(await request.formData())
    const userId = locals.currentUser.id
    const userTeamId = Number(data.userTeamId)

    const userWithUserTeams = await getUserWithUserTeamsById(userId)

    if (!userWithUserTeams.userTeams?.some((x) => x?.id === userTeamId)) {
      return fail(422, {
        error: 'User must be in the given team',
      })
    }

    await changeActiveUserTeam(userId, userTeamId)

    throw redirect(303, '/app')
  },
}
