import { JSONSchema6, JSONSchema6TypeName } from 'json-schema'
import { MAX_INTEGER, MIN_INTEGER, MIN_NUMBER, MAX_NUMBER, MIN_LENGTH, MAX_LENGTH, MIN_ITEMS, MAX_ITEMS } from './config'
import { getRandom, getRandomInt, getRandomElement } from './util'
import { infer } from './infer'

type JSONSchema6WithType = JSONSchema6 & { type: JSONSchema6TypeName }
type JSONSchema6WithTarget = JSONSchema6WithType & { target: Array<any> | object }

function shrink(schema: JSONSchema6): JSONSchema6WithType {
  let final = Object.assign({}, schema), temp = final
  while (temp.anyOf/*  || temp.oneOf || temp.allOf || temp.not */) {
    if (temp.anyOf !== undefined) {
      const anyOf = temp.anyOf
      delete temp.anyOf
      Object.assign(final, temp)
      temp = getRandomElement(anyOf)
    }
    // if (temp.allOf !== undefined) {}
    // if (temp.oneOf !== undefined) {}
    // if (temp.not !== undefined) {}
  }
  if (final.type === undefined) {
    final.type = infer(final)
  }
  return <JSONSchema6WithType>final
}

function attach(sub: JSONSchema6, queue: JSONSchema6WithTarget[]) {
  const shrinked = <JSONSchema6WithTarget>shrink(sub)
  switch (shrinked.type) {
    case 'array':
      // shrinked.target = []
      queue.push(shrinked)
      return shrinked.target = []
    case 'object':
      // shrinked.target = {}
      queue.push(shrinked)
      return shrinked.target = {}
    default:
      return shrinked.target = TypeGenerators[<JSONSchema6TypeName>shrinked.type](shrinked, queue)
  }
}

export function generate(rootSchema: JSONSchema6): any {
  if (rootSchema.const !== undefined) {
    return rootSchema.const
  } else if (rootSchema.enum !== undefined) {
    return getRandomElement(rootSchema.enum)
  } else {
    const queue: JSONSchema6WithTarget[] = []
    const result = attach(rootSchema, queue)
    let schema
    if (schema = queue.shift()) {
      TypeGenerators[<JSONSchema6TypeName>schema.type](schema, queue)
      while (schema = queue.shift()) {
        singleGenerate(schema, queue)
      }
    }
    return result
  }
}

export function singleGenerate(schema: JSONSchema6, queue: JSONSchema6WithTarget[]) {
  if (schema.const !== undefined) {
    return schema.const
  } else if (schema.enum !== undefined) {
    return getRandomElement(schema.enum)
  } else {
    const shrinked = shrink(schema)
    return TypeGenerators[<JSONSchema6TypeName>shrinked.type](shrinked, queue)
  }
}

const TypeGenerators: {
  [key in JSONSchema6TypeName]: (schema: JSONSchema6, queue: JSONSchema6WithTarget[]) => any
} = {
  any() {
    return null // not implemented
  },
  array(schema: JSONSchema6, queue: JSONSchema6WithTarget[]) {
    const target = <any[]>((<JSONSchema6WithTarget>schema).target)
    if (schema.items && Array.isArray(schema.items)) {
      target.push(...schema.items.map((sub) => {
        return attach(sub, queue)
      }))
    } else {
      const minItems = schema.minItems === undefined ? MIN_ITEMS : schema.minItems
      const maxItems = schema.maxItems === undefined ? MAX_ITEMS : schema.maxItems
      let num = getRandomInt(minItems, maxItems)
      if (schema.items) {
        const sub = <JSONSchema6>schema.items
        while (num--) {
          target.push(attach(sub, queue))
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
  object(schema: JSONSchema6, queue: JSONSchema6WithTarget[]) {
    const target = (<JSONSchema6WithTarget>schema).target
    if (schema.required === undefined) {
      return target
    }
    if (schema.properties === undefined) {
      for (const key of schema.required) {
        (<any>target)[key] = null
      }
      return target
    }
    for (const key of schema.required) {
      if (key in schema.properties) {
        const sub = schema.properties[key]
        if (typeof sub === 'object') {
          (<any>target)[key] = attach(sub, queue)
        } else if (sub) {
          (<any>target)[key] = null
        }
      }
    }
  },
  string(schema: JSONSchema6) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const min = schema.minLength === undefined ? MIN_LENGTH : schema.minLength
    const max = schema.maxLength === undefined ? MAX_LENGTH : schema.maxLength
    const length = getRandomInt(min, max)
    let text = ''
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }
}
