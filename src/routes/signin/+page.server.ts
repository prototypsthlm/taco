import {
  createUserSessionAndCookie,
  doesCredentialsMatch,
  getUserByEmail,
} from '$lib/server/entities/user'
import { verifyRecaptcha } from '$lib/utils/recaptcha.server'
import { fail, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions } from './$types'
import { PUBLIC_RECAPTCHA_DISABLED } from '$env/static/public'

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const fields = Object.fromEntries(await request.formData())
    const enableRecaptcha = PUBLIC_RECAPTCHA_DISABLED !== 'true'

    try {
      const schema = await z
        .object({
          email: z.string().email(),
          password: z.string(),
          remember: z.preprocess((value) => value === 'on', z.boolean()),
          recaptchaToken: enableRecaptcha ? z.string().min(1) : z.string().optional(),
        })
        .refine(async (data) => doesCredentialsMatch(data.email, data.password), {
          message: 'Wrong credentials',
          path: ['password'],
        })
        .parseAsync(fields)

      if (enableRecaptcha) await verifyRecaptcha(schema.recaptchaToken)
      const user = await getUserByEmail(schema.email)

      if (!user) {
        return fail(401, {
          fields,
          error: 'There is no user with that email address',
        })
      }

      await createUserSessionAndCookie(user.id, cookies, schema.remember)
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
