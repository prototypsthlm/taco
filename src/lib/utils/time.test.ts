import { describe, expect, it } from 'vitest'
import { categorizeDate, isLastYear } from './time'

const currentDate = new Date()
const dateFromLastYear = new Date(
  currentDate.getFullYear() - 1,
  currentDate.getMonth(),
  currentDate.getDate()
)
const twoYearsAgo = new Date(currentDate)
twoYearsAgo.setFullYear(currentDate.getFullYear() - 2)

const twoYearsAhead = new Date(currentDate)
twoYearsAhead.setFullYear(currentDate.getFullYear() + 2)

const twoYearsAgoYear = twoYearsAgo.getFullYear().toString()

describe(isLastYear, () => {
  it('returns true for a date from the previous year', () => {
    expect(isLastYear(dateFromLastYear)).toBe(true)
  })

  it('returns false for a date of the current year', () => {
    expect(isLastYear(currentDate)).toBe(false)
  })
})

describe(categorizeDate, () => {
  it('returns the year two years ago', () => {
    expect(categorizeDate(twoYearsAgo)).toMatchObject({
      key: twoYearsAgoYear,
      label: twoYearsAgoYear,
      isOpen: false,
    })
  }),
    it('returns "today" ', () => {
      expect(categorizeDate(currentDate)).toMatchObject({
        key: 'today',
        label: 'Today',
        isOpen: true,
      })
    }),
    it('returns "futureDate" ', () => {
      expect(categorizeDate(twoYearsAhead)).toMatchObject({
        key: 'futureDate',
        label: 'Future Date',
        isOpen: false,
      })
    })
})
