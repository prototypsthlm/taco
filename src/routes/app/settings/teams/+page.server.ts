import { changeActiveUserTeam, getUserWithUserTeamsById } from '$lib/server/entities/user'
import { fail, redirect, type Actions } from '@sveltejs/kit'

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
