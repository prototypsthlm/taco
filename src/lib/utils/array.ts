export const unique = <T>(arr: T[]) => [...new Set(arr)]

export const filterUndefinedOrNull = <T>(inputArray: (T | undefined | null)[]): T[] =>
  inputArray.filter((item): item is T => item !== undefined && item !== null)

export const findOrFail = <T>(
  arr: T[],
  predicate: (value: T, index: number, obj: T[]) => boolean
): T => {
  const found = arr.find(predicate)
  if (found === undefined) {
    throw new Error('Element not found with findOrFail.')
  }
  return found
}
