import { handleErrorWithSentry, Replay } from '@sentry/sveltekit'
import * as Sentry from '@sentry/sveltekit'

Sentry.init({
  dsn: 'https://b7b5dfa64d0464afacce38d0100f8572@o4505998171635712.ingest.sentry.io/4505998175567872',
  tracesSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // If you don't want to use Session Replay, just remove the line below:
  integrations: [new Replay()],
})

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry()
