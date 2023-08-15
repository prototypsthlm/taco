import { createUser } from '$lib/server/entities/user'
import type { Actions } from './$types'
import { z, ZodError } from 'zod'
import { dev } from '$app/environment'
import { fail, redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
          confirmPassword: z.string().min(6),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword'], // path of error
        })
        .parse(fields)

      const { sessionId } = await createUser(schema.name, schema.email, schema.password)

      if (sessionId) {
        cookies.set('session_id', sessionId, {
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          secure: !dev,
          maxAge: 60 * 60 * 24 * 7, // one week
        })
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

    const redirectUrl = url.searchParams.get('redirect') || '/app'
    throw redirect(303, redirectUrl)
  },
}
