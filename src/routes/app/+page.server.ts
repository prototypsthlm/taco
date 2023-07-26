import { changeActiveTeam, findAllTeamsFromUser } from '$lib/server/entities/user'
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
    const teamId = Number(data.teamId)

    const userTeams = await findAllTeamsFromUser(userId)

    if (!userTeams?.some((x) => x.id === teamId)) {
      return fail(422, {
        teamSection: {
          fields: data,
          error: 'User must be in the given team',
        },
      })
    }

    changeActiveTeam(userId, teamId)

    return {
      success: true,
    }
  },
}
