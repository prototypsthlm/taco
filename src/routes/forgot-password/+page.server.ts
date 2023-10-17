import { sendPasswordResetEmail } from '$lib/email/mailer'
import { getUserByEmail, updateResetTokenToUser } from '$lib/server/entities/user'
import { generateSecureRandomToken } from '$lib/server/utils/crypto'
import { fail } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, url }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          email: z.string().email().toLowerCase(),
        })
        .parse(fields)

      let user = await getUserByEmail(schema.email)

      if (!user) {
        return fail(401, {
          fields,
          error: 'There is no user with that email address',
        })
      }

      const resetToken = generateSecureRandomToken()
      user = await updateResetTokenToUser(user.id, resetToken)

      await sendPasswordResetEmail(user, url.origin, resetToken)
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
      fields,
      success: 'Password reset email sent.',
    }
  },
}
