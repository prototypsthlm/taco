import { describe, it, expect } from 'vitest'
import { countTokens } from '$lib/server/utils/tokenizer'

describe('Tokenizer functions', () => {
  it('countTokens function should return the correct token count for a given text', () => {
    const text = 'This is a test.'

    const tokenCount = countTokens(text, 'gpt-4')

    expect(tokenCount).toBe(5)
  })

  it('countTokens function should return 0 for an empty string', () => {
    const tokenCount = countTokens('', 'gpt-4')

    expect(tokenCount).toBe(0)
  })

  it('countTokens function should use the default model when none is provided', () => {
    const text = 'Default model test.'

    const tokenCountWithDefaultModel = countTokens(text)
    const tokenCountWithSpecifiedModel = countTokens(text, 'gpt-4')

    expect(tokenCountWithDefaultModel).toBe(tokenCountWithSpecifiedModel)
  })
})
