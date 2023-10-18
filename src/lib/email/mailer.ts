import { EMAIL_SENDER_SIGNATURE } from '$env/static/private'
import { PUBLIC_SITE_NAME } from '$env/static/public'

import postmark from '$lib/server/postmark'
import type { User } from '@prisma/client'
import pkg from 'handlebars'

const { compile } = pkg

export const sendEmailTemplate = async (
  user: User,
  template: string,
  data: object,
  subject: string
) => {
  const { default: htmlTemplate } = await import(`$lib/email/templates/${template}.mjml`)
  const { default: textTemplate } = await import(`$lib/email/templates/${template}.txt`)

  const compiledHtmlTemplate = compile(htmlTemplate)
  const compiledTextTemplate = compile(textTemplate)

  const emailContent = compiledHtmlTemplate(data)
  const emailTextContent = compiledTextTemplate(data)

  return await postmark.sendEmail({
    From: EMAIL_SENDER_SIGNATURE,
    To: user.email,
    Subject: subject,
    HtmlBody: emailContent,
    TextBody: emailTextContent,
    MessageStream: 'outbound',
  })
}

export const sendPasswordResetEmail = async (user: User, baseUrl: string, resetToken: string) => {
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`
  return sendEmailTemplate(
    user,
    'password-reset',
    { resetUrl, username: user.name },
    `[${PUBLIC_SITE_NAME}] Password Reset`
  )
}

export const sendVerifyUserEmail = async (
  user: User,
  baseUrl: string,
  verificationToken: string
) => {
  const verificationUrl = `${baseUrl}/verify/${verificationToken}`
  return sendEmailTemplate(
    user,
    'verify-user',
    { verificationUrl, username: user.name },
    `[${PUBLIC_SITE_NAME}] Verify User`
  )
}
