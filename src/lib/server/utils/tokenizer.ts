import { encoding_for_model, type TiktokenModel } from 'tiktoken'

export type TokenizerModel = TiktokenModel

export const countTokens = (text: string, model: TokenizerModel = 'gpt-4') => {
  const encoder = encoding_for_model(model)
  const tokens = encoder.encode(text)
  return tokens.length
}
