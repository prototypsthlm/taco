import { describe, expect, it } from 'vitest'
import { categorizeDate, isLastYear } from './time'

const currentDate = new Date()
const dateFromLastYear = new Date(
  currentDate.getFullYear() - 1,
  currentDate.getMonth(),
  currentDate.getDate()
)
const twoYearsAgo = new Date(currentDate)
const twoYearsAhead = new Date(currentDate)
twoYearsAgo.setFullYear(currentDate.getFullYear() - 2)
twoYearsAhead.setFullYear(currentDate.getFullYear() + 2)

describe(isLastYear, () => {
  it('returns true for a date from the previous year'),
    () => {
      expect(isLastYear(dateFromLastYear)).toBe(true)
    }

  it('returns false for a date of the current year'),
    () => {
      expect(isLastYear(currentDate)).toBe(false)
    }
})

describe(categorizeDate, () => {
  it('returns the year two years ago'),
    () => {
      expect(categorizeDate(twoYearsAgo)).toBe(2022)
    },
    it('returns "today" '),
    () => {
      expect(categorizeDate(currentDate)).toBe('today')
    },
    it('returns "futureDate" '),
    () => {
      expect(categorizeDate(twoYearsAhead)).toBe('futureDate')
    }
})
