import { getUserBySessionId } from '$lib/server/entities/user'
import type { Handle } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

const protectedRoutes = ['/app']
const authRoutes = ['/signin', '/signup']

export const handle: Handle = async ({ event, resolve }) => {
  const targetRoute = event.url.pathname

  // sign-out route
  if (targetRoute === '/signout') {
    event.cookies.delete('session_id', { path: '/' })
    throw redirect(303, '/')
  }

  const sessionId = event.cookies.get('session_id')

  if (!sessionId) {
    // no cookie
    // trying to access protected route
    if (protectedRoutes.some((x) => x === targetRoute)) {
      throw redirect(303, '/')
    }
  } else {
    // cookie
    // trying to access auth route while already logged in
    if (authRoutes.some((x) => x === targetRoute)) {
      throw redirect(303, '/app')
    }

    const currentUser = await getUserBySessionId(sessionId)

    if (currentUser) {
      event.locals.currentUser = currentUser

      if (
        !currentUser.activeUserTeamId &&
        !(targetRoute.includes('/app/settings') || targetRoute.includes('/invitation'))
      ) {
        // no active team -> force team selection
        throw redirect(303, '/app/settings/teams')
      }
    } else {
      event.cookies.delete('session_id', { path: '/' })
      throw redirect(303, '/')
    }
  }

  return resolve(event)
}
