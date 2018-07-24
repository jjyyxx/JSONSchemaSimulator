export const ALL_TYPES = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string']

export const MIN_INTEGER = -100000000
export const MAX_INTEGER = 100000000

export const MIN_NUMBER = -100
export const MAX_NUMBER = 100

export const MIN_LENGTH = 0
export const MAX_LENGTH = 20

export const MIN_ITEMS = 0
export const MAX_ITEMS = 20

export const MAX_LEVELS = 4

export const ENV = {
  level: 0,
  get constrainedItems() : number {
    return Math.floor(MAX_ITEMS / (1 + this.level))
  }
}
