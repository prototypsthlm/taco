import {
  deleteUser,
  getUserWithPasswordById,
  updatePassword,
  updateUserPersonalData,
} from '$lib/server/entities/user'
import { fail, redirect } from '@sveltejs/kit'
import bcrypt from 'bcryptjs'
import { z, ZodError } from 'zod'
import type { Actions } from './$types'

export const actions: Actions = {
  personal: async ({ request, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          name: z.string().min(1),
          email: z.string().email(),
        })
        .parse(fields)

      await updateUserPersonalData(locals.currentUser.id, schema.name, schema.email)

      return {
        personal: {
          success: 'Personal data updated successfully.',
        },
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          personal: {
            fields,
            errors,
          },
        })
      }

      return fail(500, {
        personal: {
          fields,
          error: `${error}`,
        },
      })
    }
  },
  password: async ({ request, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = await z
        .object({
          currentPassword: z.string().min(6),
          newPassword: z.string().min(6),
          confirmPassword: z.string().min(6),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: "Password don't match with new password.",
          path: ['confirmPassword'],
        })
        .refine((data) => data.newPassword !== data.currentPassword, {
          message: 'New password must be different from the old one.',
          path: ['newPassword'],
        })
        .refine(
          async (data) => {
            const user = await getUserWithPasswordById(locals.currentUser.id)
            return await bcrypt.compare(data.currentPassword, user.password?.hash || '')
          },
          {
            message: 'Current password is not correct.',
            path: ['currentPassword'],
          }
        )
        .parseAsync(fields)

      await updatePassword(locals.currentUser.id, schema.newPassword)

      return {
        password: {
          success: 'Password updated successfully.',
        },
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          password: {
            fields,
            errors,
          },
        })
      }

      return fail(500, {
        password: {
          fields,
          error: `${error}`,
        },
      })
    }
  },
  delete: async ({ cookies, locals }) => {
    try {
      await deleteUser(locals.currentUser.id)

      // delete cookie
      cookies.delete('session_id', { path: '/' })
    } catch (error) {
      return fail(500, {
        password: {
          error: `${error}`,
        },
      })
    }
    throw redirect(303, '/')
  },
}
