import { EMAIL_SENDER_SIGNATURE } from '$env/static/private'
import { createHtmlTemplate, createTextTemplate } from '$lib/server/email/forgot-password-template'
import { updateResetTokenToUser, getUserByEmail } from '$lib/server/entities/user'
import postmark from '$lib/server/postmark'
import { fail } from '@sveltejs/kit'
import { randomUUID } from 'crypto'
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

      const uuid = randomUUID()
      user = await updateResetTokenToUser(user.id, uuid)
      const resetUrl = `${url.origin}/reset-password/${uuid}`

      await postmark.sendEmail({
        From: EMAIL_SENDER_SIGNATURE,
        To: user.email,
        Subject: 'Password Reset',
        HtmlBody: createHtmlTemplate(resetUrl, user.name),
        TextBody: createTextTemplate(resetUrl, user.name),
        MessageStream: 'outbound',
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

    return {
      fields: {
        email: '',
      },
      success: 'Password reset email sent.',
    }
  },
}