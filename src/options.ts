import { JSONSchema6WithTarget } from './generate'

const defaults = {
  generationLimit: -1
}
const optionKeys = <OptionKey[]>Object.keys(defaults)

type OptionKey = keyof typeof defaults
type UserOptionType = {
  [key in OptionKey]: (typeof defaults)[key]
}
export type PartialOptionType = Partial<OptionType>
export type OptionType = UserOptionType & {
  queue: Pick<JSONSchema6WithTarget[], 'length' | 'shift' | 'push'>
}

export function normalize(options: PartialOptionType): OptionType {
  const result = <OptionType>{}
  for (const key of optionKeys) {
    const option = options[key]
    result[key] = option === undefined ? defaults[key] : option
  }
  result.queue = []
  return result
}
