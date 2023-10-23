import { encoding_for_model, type TiktokenModel } from 'tiktoken'

export type TokenizerModel = TiktokenModel

export const countTokens = (text: string, model: TokenizerModel = 'gpt-3.5-turbo') => {
  try {
    const encoder = encoding_for_model(model)
    const tokens = encoder.encode(text)
    return tokens.length
  } catch (e) {
    console.error(e, text, model)
    return null
  }
}
