import { JSONSchema6, JSONSchema6TypeName } from 'json-schema'
import { MAX_INTEGER, MIN_INTEGER, MIN_NUMBER, MAX_NUMBER, MIN_LENGTH, MAX_LENGTH } from './config'
import { getRandom, getRandomInt } from './util'

const TypeGenerators: {
  [key in JSONSchema6TypeName]: (schema: JSONSchema6) => any
} = {
  any() {
    return null // not implemented
  },
  array(schema: JSONSchema6) {
    return []
  },
  boolean() {
    return Math.random() > 0.5
  },
  integer(schema: JSONSchema6) {
    const min = schema.minimum === undefined ? MIN_INTEGER : schema.minimum
    const max = schema.maximum === undefined ? MAX_INTEGER : schema.maximum

    if (min > max) return NaN

    return getRandomInt(min, max)
  },
  null() {
    return null
  },
  number(schema: JSONSchema6) {
    const min = schema.minimum === undefined ? MIN_NUMBER : schema.minimum
    const max = schema.maximum === undefined ? MAX_NUMBER : schema.maximum

    if (min > max) return NaN

    return getRandom(min, max)
  },
  object() {
    return {}
  },
  string(schema: JSONSchema6) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const min = schema.minLength === undefined ? MIN_LENGTH : schema.minLength
    const max = schema.maxLength === undefined ? MAX_LENGTH : schema.maxLength
    const length = getRandomInt(min, max)
    let text = ''
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }
}

export function generate(schema: JSONSchema6): any {
  if (schema.const !== undefined) {
    return schema.const
  } else if (schema.enum !== undefined) {
    return schema.enum[getRandomInt(0, schema.enum.length - 1)]
  } else if (schema.type !== undefined) {
    return TypeGenerators[<JSONSchema6TypeName>schema.type](schema)
  }
}
