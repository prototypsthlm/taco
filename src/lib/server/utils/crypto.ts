import crypto from 'crypto'

export const generateSecureRandomToken = (size = 32) => {
  return crypto.randomBytes(size).toString('hex')
}

export const encrypt = (text: string, secretKey: string) => {
  const key = crypto.scryptSync(secretKey, 'salt', 32)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

  return iv.toString('base64') + encrypted.toString('base64')
}

export const decrypt = (encryptedText: string, secretKey: string) => {
  if (!encryptedText) {
    return encryptedText
  }
  const iv = Buffer.from(encryptedText.slice(0, 23), 'base64')
  const key = crypto.scryptSync(secretKey, 'salt', 32)
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

  return Buffer.concat([
    decipher.update(encryptedText.slice(24), 'base64'),
    decipher.final(),
  ]).toString()
}

export const encryptString = (message: string) => {
  const secretKey = process.env.SECRET_KEY

  if (!secretKey) {
    throw new Error('Secret key not found')
  }

  return encrypt(message, secretKey)
}

export const decryptString = (message: string) => {
  const secretKey = process.env.SECRET_KEY

  if (!secretKey) {
    throw new Error('Secret key not found')
  }

  return decrypt(message, secretKey)
}
