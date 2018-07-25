import { JSONSchema6, JSONSchema6TypeName } from 'json-schema'
import { MAX_INTEGER, MIN_INTEGER, MIN_NUMBER, MAX_NUMBER, MIN_LENGTH, MAX_LENGTH, MIN_ITEMS, MAX_ITEMS, MAX_LEVELS, ENV } from './config'
import { getRandom, getRandomInt, getRandomElement } from './util'
import { infer } from './infer'

type JSONSchema6WithType = JSONSchema6 & { type: JSONSchema6TypeName }
export type JSONSchema6WithTarget = JSONSchema6WithType & { target: Array<any> | object }

export function shrink(schema: JSONSchema6): JSONSchema6WithType {
  let final = Object.assign({}, schema), temp = final
  while (temp.anyOf/*  || temp.oneOf || temp.allOf || temp.not */) {
    if (temp.anyOf !== undefined) {
      const anyOf = temp.anyOf
      delete temp.anyOf
      Object.assign(final, temp)
      temp = getRandomElement(anyOf)
      Object.assign(final, temp)
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

export function attach(sub: JSONSchema6, queue: JSONSchema6WithTarget[]) {
  if (sub.const !== undefined) {
    return sub.const
  }
  if (sub.enum !== undefined) {
    return getRandomElement(sub.enum)
  }
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
      ENV.level = 0
      TypeGenerators[<JSONSchema6TypeName>schema.type](schema, queue)
      let levelNum = queue.length
      while (schema = queue.shift()) {
        const shrinked = shrink(schema)
        TypeGenerators[<JSONSchema6TypeName>shrinked.type](shrinked, queue)

        --levelNum
        if (levelNum === 0) {
          ++ENV.level
          // if (level > MAX_LEVELS) break
          levelNum = queue.length
          // TODO: further add possibility constraint based on level
        }

      }
    }
    return result
  }
}

export const ConcreteTypes: JSONSchema6TypeName[] = [/* 'array',  */'boolean', 'integer', 'null', 'number',/*  'object', */ 'string']

export const TypeGenerators: {
  [key in JSONSchema6TypeName]: (schema: JSONSchema6, queue: JSONSchema6WithTarget[]) => any
} = {
  any(schema: JSONSchema6, queue: JSONSchema6WithTarget[]) {
    return this[getRandomElement(ConcreteTypes)](schema, queue)
  },
  array(schema: JSONSchema6, queue: JSONSchema6WithTarget[]) {
    const target = <any[]>((<JSONSchema6WithTarget>schema).target)
    if (schema.items && Array.isArray(schema.items)) {
      target.push(...schema.items.map((sub) => {
        return attach(sub, queue)
      }))
    } else {
      const minItems = schema.minItems === undefined ? MIN_ITEMS : schema.minItems
      const maxItems = schema.maxItems === undefined ? /* MAX_ITEMS */ ENV.constrainedItems : schema.maxItems
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
  object(schema: JSONSchema6, queue: JSONSchema6WithTarget[]) {
    const target = (<JSONSchema6WithTarget>schema).target
    if (schema.required !== undefined) {
      if (schema.properties === undefined) {
        // for (const key of schema.required) {
        //   (<any>target)[key] = null
        // }
        return target
      } else {
        for (const key of schema.required) {
          if (key in schema.properties) {
            const sub = schema.properties[key]
            if (typeof sub === 'object') {
              (<any>target)[key] = attach(sub, queue)
            }/*  else if (sub) {
              (<any>target)[key] = null
            } */
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
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }
}
