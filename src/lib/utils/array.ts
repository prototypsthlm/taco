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

export type AsyncReducer<T, U = T> = (
  accumulator: U,
  currentValue: T,
  index: number,
  array: T[]
) => Promise<U>

export const asyncReduce = async <T, U = T>(
  array: T[],
  asyncCallback: AsyncReducer<T, U>,
  initialValue: U
): Promise<U> => {
  return array.reduce(
    async (accumulatorPromise: Promise<U>, currentValue: T, index: number): Promise<U> =>
      await asyncCallback(await accumulatorPromise, currentValue, index, array),
    Promise.resolve(initialValue)
  )
}
