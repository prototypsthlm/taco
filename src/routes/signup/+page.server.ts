import { createUser } from '$lib/entities/user'
import type { Actions } from './$types'
import { z, ZodError } from 'zod'
import { dev } from '$app/environment'
import { fail, redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
          confirmPassword: z.string().min(6),
          teamName: z.string().min(1),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword'], // path of error
        })
        .parse(fields)

      const { sessionId } = await createUser(
        schema.name,
        schema.email,
        schema.password,
        schema.teamName
      )

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
        error,
      })
    }
    throw redirect(303, '/app')
  },
}
