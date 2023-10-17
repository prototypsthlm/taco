import { dev } from '$app/environment'
import { createNotification } from '$lib/server/entities/notification'
import {
  createUserSession,
  createUserSessionAndCookie,
  getUserByResetToken,
  updatePassword,
  updateResetTokenToUser,
} from '$lib/server/entities/user'
import { NotificationType } from '@prisma/client'
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

      await createUserSessionAndCookie(user.id, cookies)

      await createNotification(
        'Password reset',
        'Your password has been reset.',
        user.id,
        NotificationType.GENERAL
      )
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
