import { PUBLIC_SENTRY_DSN, PUBLIC_SENTRY_ENV } from '$env/static/public'
import { getUserBySessionId, type UserBySessionId } from '$lib/server/entities/user'
import * as Sentry from '@sentry/sveltekit'
import { type Handle, redirect } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

Sentry.init({
  dsn: PUBLIC_SENTRY_DSN,
  environment: PUBLIC_SENTRY_ENV || 'production',
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
  }

  return resolve(event)
})
export const handleError = Sentry.handleErrorWithSentry()
