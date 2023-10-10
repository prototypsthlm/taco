import { dev } from '$app/environment'
import {
  createUserSession,
  getUserByResetToken,
  updatePassword,
  updateResetTokenToUser,
} from '$lib/server/entities/user'
import { fail, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const user = await getUserByResetToken(params.token)

  return {
    isTokenValid: !!user,
  }
}

export const actions: Actions = {
  default: async ({ request, cookies, params }) => {
    const token = params.token
    const user = await getUserByResetToken(token)
    if (!user) return fail(401, { error: 'Invalid token' })

    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          password: z.string().min(6),
          confirmPassword: z.string().min(6),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword'],
        })
        .parse(fields)

      await updatePassword(user.id, schema.password)
      await updateResetTokenToUser(user.id, null)
      const { sessionId } = await createUserSession(user.id)

      cookies.set('session_id', sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: !dev,
        maxAge: 60 * 60 * 24 * 7,
      })
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

    throw redirect(303, '/app')
  },
}
