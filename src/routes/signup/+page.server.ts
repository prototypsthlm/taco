import { sendVerifyUserEmail } from '$lib/email/mailer'
import { createUser, createUserSessionAndCookie } from '$lib/server/entities/user'
import type { Actions } from './$types'
import { z, ZodError } from 'zod'
import { fail, redirect } from '@sveltejs/kit'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { recaptchaResponse } from '$lib/utils/recaptcha'

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const fields = Object.fromEntries(await request.formData())
    let recapatchaVerification

    try {
      const schema = z
        .object({
          name: z.string().min(1),
          email: z.string().email().toLowerCase(),
          password: z.string().min(6),
          confirmPassword: z.string().min(6),
          recaptchaResponse: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword'],
        })
        .parse(fields)

      recapatchaVerification = await recaptchaResponse(schema.recaptchaResponse)

      if (recapatchaVerification) {
        const user = await createUser(schema.name, schema.email, schema.password)

        await createUserSessionAndCookie(user.id, cookies)
        if (user.password?.verificationToken) {
          await sendVerifyUserEmail(user, url.origin, user.password.verificationToken)
        } else {
          throw new Error('User verification token not found')
        }
      } else {
        return {
          status: 400,
          body: { success: false, message: 'Verification failed' },
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return fail(422, {
          fields,
          errors: error.flatten().fieldErrors,
        })
      }

      if (error instanceof PrismaClientKnownRequestError && error?.code === 'P2002') {
        return fail(422, {
          fields,
          errors: {
            email: ['Email already exists'],
          },
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
