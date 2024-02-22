import { sendVerifyUserEmail } from '$lib/email/mailer'
import { createUser, createUserSessionAndCookie } from '$lib/server/entities/user'
import { verifyRecaptcha } from '$lib/utils/recaptcha.server'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { fail, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const fields = Object.fromEntries(await request.formData())

    try {
      const schema = z
        .object({
          name: z.string().min(1),
          email: z.string().email().toLowerCase(),
          password: z.string().min(6),
          confirmPassword: z.string().min(6),
          recaptchaToken: z.string().min(1),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword'],
        })
        .parse(fields)

      await verifyRecaptcha(schema.recaptchaToken)

      const user = await createUser(schema.name, schema.email, schema.password)

      await createUserSessionAndCookie(user.id, cookies)
      if (user.password?.verificationToken) {
        await sendVerifyUserEmail(user, url.origin, user.password.verificationToken)
      } else {
        return fail(500, {
          fields,
          error: 'User verification token not found',
        })
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
