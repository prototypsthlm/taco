import {
  getUserByResetToken,
  updatePassword,
  updateResetTokenToUser,
} from '$lib/server/entities/user'
import { fail } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const token = params.token
  const user = await getUserByResetToken(token)

  if (user) return { isTokenValid: true }
  else return { isTokenValid: false }
}

export const actions: Actions = {
  default: async ({ request, params }) => {
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

    return {
      success: true,
    }
  },
}
