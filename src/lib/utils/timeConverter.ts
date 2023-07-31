export function getTimeSince(date: Date): string {
  const now = new Date()
  const timeDifference = now.getTime() - date.getTime()

  const millisecondsPerSecond = 1000
  const secondsPerMinute = 60
  const minutesPerHour = 60
  const hoursPerDay = 24
  const daysPerWeek = 7

  const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute
  const millisecondsPerHour = millisecondsPerMinute * minutesPerHour
  const millisecondsPerDay = millisecondsPerHour * hoursPerDay
  const millisecondsPerWeek = millisecondsPerDay * daysPerWeek

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
