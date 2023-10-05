import { sequence } from '@sveltejs/kit/hooks'
import * as Sentry from '@sentry/sveltekit'
import { type UserBySessionId, getUserBySessionId } from '$lib/server/entities/user'
import { type Handle, redirect } from '@sveltejs/kit'

Sentry.init({
  dsn: 'https://b7b5dfa64d0464afacce38d0100f8572@o4505998171635712.ingest.sentry.io/4505998175567872',
  tracesSampleRate: 1,
})

const protectedRoutes = ['/app']
const authRoutes = ['/signin', '/signup']

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
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
    let currentUser: UserBySessionId

    try {
      currentUser = await getUserBySessionId(sessionId)
      event.locals.currentUser = currentUser
    } catch (e) {
      event.cookies.delete('session_id', { path: '/' })
      throw redirect(303, '/')
    }

    event.locals.currentUser = currentUser

    if (
      !currentUser.activeUserTeamId &&
      !(targetRoute.includes('/app/settings') || targetRoute.includes('/invitation'))
    ) {
      // no active team -> force team selection
      throw redirect(303, '/app/settings/teams')
    }
  }

  return resolve(event)
})
export const handleError = Sentry.handleErrorWithSentry()
