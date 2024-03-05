const millisecondsPerSecond = 1000
const secondsPerMinute = 60
const minutesPerHour = 60
const hoursPerDay = 24
const daysPerWeek = 7

const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute
const millisecondsPerHour = millisecondsPerMinute * minutesPerHour
const millisecondsPerDay = millisecondsPerHour * hoursPerDay
const millisecondsPerWeek = millisecondsPerDay * daysPerWeek
const previousSevenDays = millisecondsPerWeek
const lastThirtyDays = millisecondsPerDay * 30

const currentYear = new Date().getFullYear()

const millisecondsSince = (date: Date) => {
  const now = new Date()
  return date > now ? 0 : now.getTime() - date.getTime()
}

export const timeSince = (date: Date) => {
  const timeDifference = millisecondsSince(date)
  if (timeDifference === 0) {
    return '0s'
  }
  if (timeDifference < millisecondsPerMinute) {
    return `${Math.floor(timeDifference / millisecondsPerSecond)}s`
  } else if (timeDifference < millisecondsPerHour) {
    return `${Math.floor(timeDifference / millisecondsPerMinute)}m`
  } else if (timeDifference < millisecondsPerDay) {
    return `${Math.floor(timeDifference / millisecondsPerHour)}h`
  } else if (timeDifference < millisecondsPerWeek) {
    return `${Math.floor(timeDifference / millisecondsPerDay)}d`
  } else {
    return `${Math.floor(timeDifference / millisecondsPerWeek)}w`
  }
}


export const categorizeDate = (date: Date): { key: string; label: string; isOpen: boolean } => {
  if (isToday(date)) {
    return { key: 'today', label: 'Today', isOpen: true }
  } else if (isYesterday(date)) {
    return { key: 'yesterday', label: 'Yesterday', isOpen: true }
  } else if (
    millisecondsPerDay < millisecondsSince(date) &&
    millisecondsSince(date) <= previousSevenDays
  ) {

    return { key: 'previousSevenDays', label: 'Previous 7 Days', isOpen: true }
  } else if (
    previousSevenDays < millisecondsSince(date) &&
    millisecondsSince(date) <= lastThirtyDays
  ) {
    return { key: 'lastMonth', label: 'Previous 30 Days', isOpen: true }
  } else if (date.getFullYear() <= currentYear) {
    const year = date.getFullYear().toString()
    return { key: year, label: year, isOpen: false }
  } else {
    return { key: 'futureDate', label: 'Future Date', isOpen: false }
  }
}

export const isLastYear = (date: Date) => {
  const now = new Date()

  return date.getFullYear() === now.getFullYear() - 1
}

const isToday = (date: Date) => {
  const now = new Date()

  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

const isYesterday = (date: Date) => {
  const now = new Date()
  const yesterday = new Date(now)

  yesterday.setDate(now.getDate() - 1)

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}
