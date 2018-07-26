import { JSONSchema6, JSONSchema6Type, JSONSchema6TypeName } from 'json-schema'
import {
  ENV, MAX_INTEGER, MAX_ITEMS, MAX_LENGTH, MAX_LEVELS,
  MAX_NUMBER, MIN_INTEGER, MIN_ITEMS, MIN_LENGTH, MIN_NUMBER
} from './config'
import { infer } from './infer'
import { OptionType } from './options'
import { getRandom, getRandomElement, getRandomInt } from './util'

type JSONSchema6WithType = JSONSchema6 & { type: JSONSchema6TypeName }
type ConcreteTypes = Exclude<JSONSchema6TypeName, 'any'>
export type JSONSchema6WithTarget = JSONSchema6WithType & { target: any[] | object }

export const ConcreteTypes: JSONSchema6TypeName[] =
  ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string']

export function shrink(schema: JSONSchema6): JSONSchema6WithType {
  const final: JSONSchema6 = {}
  let temp = Object.assign({}, schema)
  while (temp.anyOf/*  || temp.oneOf || temp.allOf || temp.not */) {
    // if (temp.anyOf !== undefined) {
      const anyOf = temp.anyOf
      delete temp.anyOf
      Object.assign(final, temp)
      temp = Object.assign({}, getRandomElement(anyOf)) // may fail with circular reference
    // }
    // if (temp.allOf !== undefined) {}
    // if (temp.oneOf !== undefined) {}
    // if (temp.not !== undefined) {}
  }
  Object.assign(final, temp)
  if (final.type === undefined) {
    final.type = infer(final)
  }
  if (final.type === 'any') {
    final.type = getRandomElement(ConcreteTypes)
  }
  return <JSONSchema6WithType>final
}

export function getConstOrEnum(schema: JSONSchema6): JSONSchema6Type | undefined {
  if (schema.const !== undefined) {
    return schema.const
  }
  if (schema.enum !== undefined) {
    return getRandomElement(schema.enum)
  }
}

export function typeGenerate(schema: JSONSchema6, options: OptionType) {
  const shrinked = <JSONSchema6WithTarget>shrink(schema)
  switch (shrinked.type) {
    case 'array':
      options.queue.push(shrinked)
      return shrinked.target = []
    case 'object':
      options.queue.push(shrinked)
      return shrinked.target = {}
    default:
      return shrinked.target = TypeGenerators[<ConcreteTypes>shrinked.type](shrinked, options)
  }
}

export function subGenerate(sub: JSONSchema6, options: OptionType) {
  const value = getConstOrEnum(sub)
  return value === undefined ? typeGenerate(sub, options) : value
}

export function generate(rootSchema: JSONSchema6, options: OptionType): any {
  const value = getConstOrEnum(rootSchema)
  if (value !== undefined) {
    return value
  }
  const result = typeGenerate(rootSchema, options)
  let schema
  if (schema = options.queue.shift()) {
    ENV.level = 0
    TypeGenerators[<ConcreteTypes>schema.type](schema, options)
    let levelNum = options.queue.length
    while (schema = options.queue.shift()) {
      const shrinked = shrink(schema)
      TypeGenerators[<ConcreteTypes>shrinked.type](shrinked, options)

      --levelNum
      if (levelNum === 0) {
        ++ENV.level
        // if (level > MAX_LEVELS) break
        levelNum = options.queue.length
        // TODO: further add possibility constraint based on level
      }
    }
  }
  return result
}

export const TypeGenerators: {
  [key in ConcreteTypes]: (schema: JSONSchema6, options: OptionType) => any
} = {
  array(schema: JSONSchema6, options: OptionType) {
    const target = <any[]>((<JSONSchema6WithTarget>schema).target)
    if (schema.items && Array.isArray(schema.items)) {
      target.push(...schema.items.map((sub) => {
        return subGenerate(sub, options)
      }))
    } else {
      const minItems = schema.minItems === undefined ? MIN_ITEMS : schema.minItems
      const maxItems = schema.maxItems === undefined ? /* MAX_ITEMS */ ENV.constrainedItems : schema.maxItems
      let num = getRandomInt(minItems, maxItems)
      if (schema.items) {
        const sub = <JSONSchema6>schema.items
        while (num--) {
          target.push(subGenerate(sub, options))
        }
      } else {
        while (num--) {
          target.push(null)
        }
      }
    }
    return target
  },
  boolean() {
    return Math.random() > 0.5
  },
  integer(schema: JSONSchema6) {
    const min = schema.minimum === undefined ? MIN_INTEGER : schema.minimum
    const max = schema.maximum === undefined ? MAX_INTEGER : schema.maximum
    return getRandomInt(min, max)
  },
  null() {
    return null
  },
  number(schema: JSONSchema6) {
    const min = schema.minimum === undefined ? MIN_NUMBER : schema.minimum
    const max = schema.maximum === undefined ? MAX_NUMBER : schema.maximum
    return getRandom(min, max)
  },
  object(schema: JSONSchema6, options: OptionType) {
    const target = <{ [key: string]: string }>((<JSONSchema6WithTarget>schema).target)
    if (schema.required !== undefined && schema.properties !== undefined) {
      for (const key of schema.required) {
        if (key in schema.properties) {
          const sub = schema.properties[key]
          if (typeof sub === 'object') {
            target[key] = subGenerate(sub, options)
          }
        }
      }
    }
    return target
  },
  string(schema: JSONSchema6) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const min = schema.minLength === undefined ? MIN_LENGTH : schema.minLength
    const max = schema.maxLength === undefined ? MAX_LENGTH : schema.maxLength
    const length = getRandomInt(min, max)
    let text = ''
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }
}
