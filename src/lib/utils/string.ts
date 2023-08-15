export const trim = (s: string, substring: string): string => {
  const escapedSubstring = substring.replace(/[-\\/^$*+?.()|[\]{}]/g, '\\$&') // escape special characters
  const regex = new RegExp(`^${escapedSubstring}|${escapedSubstring}$`, 'g')
  return s.replace(regex, '')
}
