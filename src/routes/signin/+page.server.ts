import { dev } from '$app/environment'
import {
  createUserSession,
  createUserSessionAndCookie,
  doesCredentialsMatch,
  getUserByEmail,
} from '$lib/server/entities/user'
import { fail, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = await z
        .object({
          email: z.string().email(),
          password: z.string().min(1),
          remember: z.preprocess((value) => value === 'on', z.boolean()),
        })
        .refine(async (data) => doesCredentialsMatch(data.email, data.password), {
          message: 'Wrong credentials',
          path: ['password'],
        })
        .parseAsync(fields)

      const user = await getUserByEmail(schema.email)

      if (!user) {
        return fail(401, {
          fields,
          error: 'There is no user with that email address',
        })
      }

      await createUserSessionAndCookie(user.id, cookies, schema.remember)
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

    const redirectUrl = url.searchParams.get('redirect') || '/app'
    throw redirect(303, redirectUrl)
  },
}
