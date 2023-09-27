import { describe, it, expect } from 'vitest'
import { unique, filterUndefinedOrNull, findOrFail } from '$lib/utils/array'

describe('Array functions tests', () => {
  describe('unique function tests', () => {
    it('removes duplicate values from an array', () => {
      const input = [1, 2, 3, 2, 4, 3, 5]
      const result = unique(input)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('returns empty array for empty input', () => {
      expect(unique([])).toEqual([])
    })
  })

  describe('filterUndefinedOrNull function tests', () => {
    it('filters out undefined and null values', () => {
      const input = [1, null, 3, undefined, 5, null, 7]
      const result = filterUndefinedOrNull(input)
      expect(result).toEqual([1, 3, 5, 7])
    })

    it('returns empty array if all values are undefined or null', () => {
      expect(filterUndefinedOrNull([null, undefined, null])).toEqual([])
    })

    it('returns the same array if there are no undefined or null values', () => {
      expect(filterUndefinedOrNull([1, 2, 3])).toEqual([1, 2, 3])
    })
  })

  describe('findOrFail function tests', () => {
    it('returns the first value that satisfies the predicate', () => {
      const input = [1, 2, 3, 4, 5]
      const result = findOrFail(input, (value) => value > 3)
      expect(result).toBe(4)
    })

    it('throws an error if no value satisfies the predicate', () => {
      const input = [1, 2, 3, 4, 5]
      expect(() => findOrFail(input, (value) => value > 10)).toThrow(
        'Element not found with findOrFail.'
      )
    })
  })
})
