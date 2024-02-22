import { PUBLIC_RECAPTCHA_SITE_KEY } from '$env/static/public'

export interface ReCaptcha {
  ready(callback: () => void): void

  execute(siteKey: string, options: { action: string }): Promise<string>
}

export const executeRecaptcha = async (grecaptcha: ReCaptcha): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    if (!grecaptcha) {
      reject(new Error('reCAPTCHA is not available'))
      return
    }
    grecaptcha.ready(() => {
      try {
        grecaptcha
          .execute(PUBLIC_RECAPTCHA_SITE_KEY, { action: 'submit' })
          .then((token: string) => {
            resolve(token)
          })
          .catch((error: Error) => {
            console.error('reCAPTCHA error:', error)
            reject(error)
          })
      } catch (error) {
        console.error('reCAPTCHA error:', error)
        reject(error)
      }
    })
  })
}
