import {
  createUserSessionAndCookie,
  getUserByVerifyToken,
  markUserAsVerified,
} from '$lib/server/entities/user'
import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, cookies }) => {
  const user = await getUserByVerifyToken(params.token)

  if (!user) {
    throw error(401, 'Invalid token')
  }

  await markUserAsVerified(user.id)

  await createUserSessionAndCookie(user.id, cookies)

  throw redirect(303, '/app')
}
