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

export function getTimeSince(date: Date) {
  const now = new Date()
  return now.getTime() - date.getTime()
}

export function getTimeSinceToString(date: Date) {
  const timeDifference = getTimeSince(date)

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
