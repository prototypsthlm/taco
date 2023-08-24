import {
  createLlmPersonality,
  getLlmPersonalitiesByUserId,
} from '$lib/server/entities/llmPersonalities'
import { fail } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { currentUser } }) => {
  const llmPersonalities = await getLlmPersonalitiesByUserId(currentUser.id)

  return {
    personalities: llmPersonalities,
  }
}

export const actions: Actions = {
  addPersonality: async ({ request, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          name: z.string().min(1),
          context: z.string().min(1),
        })
        .parse(fields)

      const userId = locals.currentUser.id
      await createLlmPersonality(userId, schema.name, schema.context)
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
