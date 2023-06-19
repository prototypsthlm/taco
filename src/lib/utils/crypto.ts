import crypto from 'crypto'

export const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex')
}
