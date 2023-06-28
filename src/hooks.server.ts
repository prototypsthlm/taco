import { getUserBySessionId } from '$lib/entities/user'
import type { Handle } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

const protectedRoutes = ['/app']
const authRoutes = ['/signin', '/signup']

export const handle: Handle = async ({ event, resolve }) => {
  // sign-out route
  if (event.url.searchParams.get('signout')) {
    await event.cookies.delete('session_id', { path: '/' })
    return resolve(event)
  }

  const sessionId = event.cookies.get('session_id')

  // no cookie
  if (!sessionId) {
    // trying to access protected route
    if (protectedRoutes.some((x) => x.startsWith(event.url.pathname))) {
      throw redirect(303, '/')
    }
  } else {
    // cookie
    // trying to access auth route while already logged in
    if (authRoutes.some((x) => x.startsWith(event.url.pathname))) {
      throw redirect(303, '/app')
    }

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
