export const estimateTokenCount = (text: string): number => {
  // Define a regular expression pattern to match tokens
  const tokenPattern = /\w+|[^\w\s]+/g

  // Tokenize the text and count the tokens
  const tokens = text.match(tokenPattern)
  const tokenCount = tokens ? tokens.length : 0

  return tokenCount
}
