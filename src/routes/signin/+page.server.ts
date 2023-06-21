import { dev } from '$app/environment'
import { getUserIfCredentialsMatch, setSessionId } from '$lib/entities/user'
import { fail, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          email: z.string().email(),
          password: z.string().min(1),
          remember: z.preprocess((value) => value === 'on', z.boolean()),
        })
        .parse(data)

      const maybeUser = await getUserIfCredentialsMatch(schema.email, schema.password)

      if (!maybeUser) {
        return fail(401, {
          data,
          error: 'Wrong credentials',
        })
      }

      const { sessionId } = await setSessionId(maybeUser.id)

      cookies.set('session_id', sessionId || '', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: !dev,
        maxAge: schema.remember ? 60 * 60 * 24 * 7 : undefined, // one week or undefined
      })
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          data,
          errors,
        })
      }

      return fail(500, {
        data,
        error,
      })
    }

    throw redirect(303, '/app')
  },
}
