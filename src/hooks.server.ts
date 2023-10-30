import { PUBLIC_SENTRY_DSN, PUBLIC_SENTRY_ENV } from '$env/static/public'
import { getUserBySessionId } from '$lib/server/entities/user'
import * as Sentry from '@sentry/sveltekit'
import { type Handle, redirect } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

if (PUBLIC_SENTRY_ENV !== 'test') {
  Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    environment: PUBLIC_SENTRY_ENV || 'production',
    tracesSampleRate: 1,
  })
}
const protectedRoutes = ['/app']
const authRoutes = ['/signin', '/signup']

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
  const targetRoute = event.url.pathname
  const sessionId = event.cookies.get('session_id')

  if (!sessionId && isProtectedRoute(targetRoute)) {
    throw redirect(303, '/signin')
  }

  if (sessionId && isAuthRoute(targetRoute)) {
    throw redirect(303, '/app')
  }

  if (sessionId) {
    try {
      event.locals.currentUser = await getUserBySessionId(sessionId)
    } catch (e) {
      event.cookies.delete('session_id', { path: '/' })
      throw redirect(303, '/')
    }
  }

  return resolve(event)
})

function isProtectedRoute(route: string) {
  return protectedRoutes.some((x) => route.startsWith(x))
}

function isAuthRoute(route: string) {
  return authRoutes.some((x) => route.startsWith(x))
}

export const handleError = Sentry.handleErrorWithSentry()
