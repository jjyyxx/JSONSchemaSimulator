export function getRandom(min: number, max: number): number {
  if (min > max) {
    return NaN
  }
  return Math.random() * (max - min) + min
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  if (min > max) {
    return NaN
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomElement<T>(array: T[]): T {
  return array[getRandomInt(0, array.length - 1)]
}

export function getType(source: any): 'object' | 'array' | 'undefined' | 'others' {
  const type = typeof source
  if (type === 'undefined') {
    return 'undefined'
  }
  if (type === 'object' && source !== null) {
    return Array.isArray(source) ? 'array' : 'object'
  }
  return 'others'
}

export function merge(target: any, source: any) {
  const targetType = getType(target)
  const sourceType = getType(source)
  if (sourceType !== targetType) {
    return target
  }
  if (targetType !== 'object') {
    return source
  }
  const result: any = {}
  for (const key of Object.keys(target)) {
    result[key] = merge(target[key], source[key])
  }
  return result
}

export function clone<T>(source: T): T {
  return typeof source === 'object' ? JSON.parse(JSON.stringify(source)) : source
}
