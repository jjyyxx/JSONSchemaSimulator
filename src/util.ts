export function getRandom(min: number, max: number): number {
  if (min > max) return NaN
  return Math.random() * (max - min) + min
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  if (min > max) return NaN
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomElement<T>(array: T[]): T {
  return array[getRandomInt(0, array.length - 1)]
}
