import { describe, expect, it } from 'vitest'
import { isLastYear } from './time'

const currentDate = new Date()
const dateFromLastYear = new Date(
  currentDate.getFullYear() - 1,
  currentDate.getMonth(),
  currentDate.getDate()
)

//Chat with date from last year
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
