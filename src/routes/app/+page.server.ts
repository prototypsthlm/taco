import { getLlmPersonalitiesByUserId } from '$lib/server/entities/llmPersonalities'
import { doesNotificationBelongToUser, markAsRead } from '$lib/server/entities/notification'
import { changeActiveUserTeam, getUserWithUserTeamsById } from '$lib/server/entities/user'
import { fail, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
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
  markAsRead: async ({ request, locals }) => {
    const fields = Object.fromEntries(await request.formData())

    try {
      const schema = z
        .object({
          notificationId: z.preprocess(Number, z.number()),
        })
        .parse(fields)

      const belong = await doesNotificationBelongToUser(
        schema.notificationId,
        locals.currentUser.id
      )

      if (!belong) {
        return fail(422, {
          error: 'Notification does not belong to user',
        })
      }

      await markAsRead(schema.notificationId)

      return {
        notificationId: schema.notificationId,
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          errors,
        })
      }

      return fail(500, {
        error: `${error}`,
      })
    }
  },
}
