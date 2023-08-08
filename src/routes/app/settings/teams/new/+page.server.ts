import { z, ZodError } from 'zod'
import type { Actions } from './$types'

export const actions: Actions = {
  updateTeamDetails: async ({ request, params, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          openAiApiKey: z.string().min(1),
          name: z.string().min(1),
        })
        .parse(fields)

      if (!(await isUserAdmin(Number(params.id), locals.currentUser.id))) {
        return fail(422, {
          keySection: {
            fields,
            error: 'User must be admin of the given team',
          },
        })
      }

      await updateTeam(Number(params.id), schema.name, schema.openAiApiKey)

      return {
        keySection: {
          success: 'Team updated successfully.',
        },
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          keySection: {
            fields,
            errors,
          },
        })
      }

      return fail(500, {
        keySection: {
          fields,
          error: `${error}`,
        },
      })
    }
  },
}
