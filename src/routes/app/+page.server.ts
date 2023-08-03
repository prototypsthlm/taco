import { changeActiveUserTeam, getUserWithUserTeamsById } from '$lib/server/entities/user'
import { sendMessage } from '$lib/server/utils/chatting'
import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
  sendMessage: async ({ request, locals }) => {
    const data = Object.fromEntries(await request.formData())

    const res = await sendMessage(data, locals.currentUser)

    if (res.error) {
      return fail(res.error.httpStatusCode, {
        data: res.error.data,
        errors: res.error.error,
      })
    }

    return res
  },
  selectTeam: async ({ request, locals }) => {
    const data = Object.fromEntries(await request.formData())
    const userId = locals.currentUser.id
    const userTeamId = Number(data.userTeamId)

    const userWithUserTeams = await getUserWithUserTeamsById(userId)

    if (!userWithUserTeams.userTeams?.some((x) => x?.id === userTeamId)) {
      return fail(422, {
        teamSection: {
          fields: data,
          error: 'User must be in the given team',
        },
      })
    }

    await changeActiveUserTeam(userId, userTeamId)

    return {
      success: true,
    }
  },
}
