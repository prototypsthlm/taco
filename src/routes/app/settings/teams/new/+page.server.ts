import { createTeam, getTeamByName } from '$lib/server/entities/team'
import { createUserTeam } from '$lib/server/entities/userTeams'
import { Role } from '@prisma/client'
import { fail, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions } from './$types'

export const actions: Actions = {
  createTeam: async ({ request, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    let newTeam
    try {
      const schema = z
        .object({
          name: z.string().min(1),
          openAiApiKey: z.string().optional(),
          ollamaBaseUrl: z.string().optional(),
        })
        .superRefine(({ openAiApiKey, ollamaBaseUrl }, refinementContext) => {
          if (!openAiApiKey && !ollamaBaseUrl) {
            return refinementContext.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Please provide an API Key or Ollama Url',
            })
          }
        })
        .parse(fields)
      const team = await getTeamByName(schema.name)

      if (team) {
        return fail(409, {
          fields,
          error: 'Team name already exists.',
        })
      }

      newTeam = await createTeam(
        schema.name,
        schema.openAiApiKey ?? null,
        schema.ollamaBaseUrl ?? null
      )
      await createUserTeam(locals.currentUser.id, newTeam.id, Role.OWNER)
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
    throw redirect(303, `/app/settings/teams/${newTeam.id}`)
  },
}
