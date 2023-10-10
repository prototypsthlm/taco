import { describe, it, expect } from 'vitest'
import { generateSecureRandomToken, encrypt, decrypt } from '$lib/server/utils/crypto'

describe('Crypto functions', () => {
  it('generateSecureRandomToken generates a valid secure token', () => {
    const sessionId = generateSecureRandomToken()

    expect(typeof sessionId).toBe('string')
    expect(sessionId).toHaveLength(64) // randomBytes(32) will generate a string of length 64
  })

  it('encrypt function encrypts the given text', () => {
    const secretKey = 'secret'
    const text = 'test'

    const encrypted = encrypt(text, secretKey)

    expect(encrypted).not.toBe(text)
  })

  it('decrypt function decrypts the encrypted text back to original', () => {
    const secretKey = 'secret'
    const text = 'test'

    const encrypted = encrypt(text, secretKey)
    const decrypted = decrypt(encrypted, secretKey)

    expect(decrypted).toBe(text)
  })

  it('decrypt function returns empty string when no encrypted text is provided', () => {
    const secretKey = 'secret'

    const decrypted = decrypt('', secretKey)

    expect(decrypted).toBe('')
  })
})
