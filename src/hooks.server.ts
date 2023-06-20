import { getUserBySessionId } from '$lib/entities/user'
import type { Handle } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

const unProtectedRoutes = ['/', '/signin', '/signup']

export const handle: Handle = async ({ event, resolve }) => {
  // sign-out route
  if (event.url.searchParams.get('signout')) {
    await event.cookies.delete('session_id', { path: '/' })
    return resolve(event)
  }

  const sessionId = event.cookies.get('session_id')

  // no cookie
  if (!sessionId) {
    if (!unProtectedRoutes.includes(event.url.pathname)) {
      throw redirect(303, '/')
    }
  } else {
    // cookie and trying to access protected route
    const currentUser = await getUserBySessionId(sessionId)

    if (currentUser) {
      event.locals.currentUser = currentUser
    } else {
      await event.cookies.delete('session_id', { path: '/' })
      throw redirect(303, '/')
    }
  }

  return resolve(event)
}
