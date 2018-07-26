import { JSONSchema6WithTarget } from './generate'
import { merge } from './util'

const defaults = {
  generationLimit: -1,
  limits: {
    minInteger: -100000000,
    maxInteger: 100000000,

    minNumber: -100,
    maxNumber: 100,

    minLength: 0,
    maxLength: 20,

    minItems: 0,
    maxItems: 20
  },
  infer: {
    numPreference: <'integer' | 'number'>'integer'
  },
  maxLevels: -1,
  getConstrainedItems(): number {
    return Math.floor(this.limits.maxItems / (1 + (<any>this).env.level))
  }
}
const optionKeys = <OptionKey[]>Object.keys(defaults)

type OptionKey = keyof typeof defaults
type UserOptionType = {
  [key in OptionKey]: (typeof defaults)[key]
}
export type PartialOptionType = Partial<OptionType>
export type OptionType = UserOptionType & {
  env: {
    queue: Pick<JSONSchema6WithTarget[], 'length' | 'shift' | 'push'>,
    level: number
  }
}

export function normalize(options: PartialOptionType): OptionType {
  const result = <OptionType>merge(defaults, options)
  result.env = {
    queue: [],
    level: 0
  }
  return result
}
