export const calcTokenCount = (text: string | null): number => {
  if (!text) return 0
  // Define a regular expression pattern to match tokens
  const tokenPattern = /\w+|[^\w\s]+/g

  // Tokenize the text and count the tokens
  const tokens = text.match(tokenPattern)
  return tokens ? tokens.length : 0
}
