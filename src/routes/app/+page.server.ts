import { getLlmPersonalitiesByUserId } from '$lib/server/entities/llmPersonalities'
import { changeActiveUserTeam, getUserWithUserTeamsById } from '$lib/server/entities/user'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { currentUser } }) => {
  const llmPersonalities = await getLlmPersonalitiesByUserId(currentUser.id)

  if (llmPersonalities.length === 0) return { llmPersonalities: null }
  return { llmPersonalities }
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
