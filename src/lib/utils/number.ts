export const generateRandomInt = (min = 1, max = 99999) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
