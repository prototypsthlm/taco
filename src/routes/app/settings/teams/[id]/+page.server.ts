import { updateTeam } from '$lib/server/entities/team'
import { getUserWithRelationsById } from '$lib/server/entities/user'
import { Role } from '@prisma/client'
import type { Actions } from './$types'
import { z, ZodError } from 'zod'
import { fail } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          openAiApiKey: z.string().min(1),
          name: z.string().min(1),
        })
        .parse(fields)

      const user = await getUserWithRelationsById(locals.currentUser.id)

      if (
        !user?.userTeams.some((x) => x.teamId?.toString() === params.id && x.role === Role.ADMIN)
      ) {
        return fail(422, {
          fields,
          error: 'User must be admin of the given team',
        })
      }

      await updateTeam(parseInt(params.id, 10), schema.name, schema.openAiApiKey)

      return {
        success: 'Team updated successfully.',
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          fields,
          errors,
        })
      }

      return fail(500, {
        fields,
        error: `${error}`,
      })
    }
  },
}
