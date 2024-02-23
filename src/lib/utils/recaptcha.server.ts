import { RECAPTCHA_SECRET_KEY } from '$env/static/private'

export async function verifyRecaptcha(response: string) {
  const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${RECAPTCHA_SECRET_KEY}&response=${response}`,
  })

  const result = await recaptchaResponse.json()
  if (!result.success || result.score <= 0.5) {
    throw new Error(`Recaptcha verification failed. result: ${JSON.stringify(result, null, 2)}`)
  }
}
