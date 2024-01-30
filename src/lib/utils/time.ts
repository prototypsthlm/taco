export const millisecondsPerSecond = 1000
export const secondsPerMinute = 60
export const minutesPerHour = 60
export const hoursPerDay = 24
export const daysPerWeek = 7

export const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute
export const millisecondsPerHour = millisecondsPerMinute * minutesPerHour
export const millisecondsPerDay = millisecondsPerHour * hoursPerDay
export const millisecondsPerWeek = millisecondsPerDay * daysPerWeek
export const previousSevenDays = millisecondsPerWeek
export const lastThirtyDays = millisecondsPerDay * 30

export const currentYear = new Date().getFullYear()

export const millisecondsSince = (date: Date) => {
  const now = new Date()
  return date > now ? 0 : now.getTime() - date.getTime()
}

export const timeSince = (date: Date) => {
  const timeDifference = millisecondsSince(date)
  while (timeDifference != 0) {
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
  return 0
}

export const categorizeDate = (date: Date) => {
  if (isToday(date)) {
    return 'today'
  } else if (isYesterday(date)) {
    return 'yesterday'
  } else if (
    millisecondsPerDay < millisecondsSince(date) &&
    millisecondsSince(date) <= previousSevenDays
  ) {
    return 'previousSevenDays'
  } else if (
    previousSevenDays < millisecondsSince(date) &&
    millisecondsSince(date) <= lastThirtyDays
  ) {
    return 'lastMonth'
  } else if (date.getFullYear() >= currentYear) {
    const year = date.getFullYear()
    return year
  } else {
    return 'undefined'
  }
}

export const isLastYear = (date: Date) => {
  const now = new Date()

  return date.getFullYear() === now.getFullYear() - 1
}

export const isToday = (date: Date) => {
  const now = new Date()

  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

export const isYesterday = (date: Date) => {
  const now = new Date()
  const yesterday = new Date(now)

  yesterday.setDate(now.getDate() - 1)

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}
