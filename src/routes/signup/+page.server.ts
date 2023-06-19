import { createUser } from '$lib/server/user'
import type { Actions } from './$types'
import { z, ZodError } from 'zod'
import { dev } from '$app/environment'
import { fail, redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = Object.fromEntries(await request.formData())
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
        .parse(data)

      const { id } = await createUser(schema.email, schema.password, schema.teamName)

      cookies.set('session_id', id.toString(), {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: !dev,
        maxAge: 60 * 60 * 24 * 7, // one week
      })
    } catch (e) {
      if (e instanceof ZodError) {
        const errors = e.flatten().fieldErrors

        return fail(422, {
          data,
          errors,
        })
      }

      return fail(500, {
        data,
        errors: e,
      })
    }

    throw redirect(303, '/app')
  },
}
