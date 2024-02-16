const secretKey = RECAPTCHA_SECRET_KEY
import { RECAPTCHA_SECRET_KEY } from '$env/static/private'

export async function recaptchaResponse(response: string) {
  const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secretKey}&response=${response}`,
  })

  const result = await recaptchaResponse.json()
  return result.success && result.score > 0.5
}
