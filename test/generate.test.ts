import { JSONSchema6 } from 'json-schema'
import {
  MAX_INTEGER, MAX_ITEMS, MAX_LENGTH, MAX_NUMBER,
  MIN_INTEGER, MIN_ITEMS, MIN_LENGTH, MIN_NUMBER
} from '../src/config'
import { generate, getConstOrEnum, JSONSchema6WithTarget, shrink, typeGenerate, TypeGenerators } from '../src/generate'
import { normalize } from '../src/options'

describe('Generator types test', () => {
  it('should generate BOOLEAN correctly', () => {
    expect(typeof TypeGenerators.boolean({}, normalize({}))).toBe('boolean')
  })
  it('should generate INTEGER correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const res1 = TypeGenerators.integer({
        type: 'integer'
      }, normalize({}))
      expect(Number.isInteger(res1)).toBe(true)
      expect(res1).toBeGreaterThanOrEqual(MIN_INTEGER)
      expect(res1).toBeLessThanOrEqual(MAX_INTEGER)

      const res2 = TypeGenerators.integer({
        type: 'integer',
        maximum: 3,
        minimum: 2
      }, normalize({}))
      expect(Number.isInteger(res2)).toBe(true)
      expect(res2).toBeGreaterThanOrEqual(2)
      expect(res2).toBeLessThanOrEqual(3)

      const res3 = TypeGenerators.integer({
        type: 'integer',
        maximum: 2,
        minimum: 3
      }, normalize({}))
      expect(res3).toBeNaN()
    }
  })
  it('should generate NULL correctly', () => {
    expect(TypeGenerators.null({}, normalize({}))).toBeNull()
  })
  it('should generate NUMBER correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const res1 = TypeGenerators.number({
        type: 'number'
      }, normalize({}))
      expect(res1).toBeGreaterThanOrEqual(MIN_NUMBER)
      expect(res1).toBeLessThanOrEqual(MAX_NUMBER)

      const res2 = TypeGenerators.number({
        type: 'number',
        maximum: 5.6,
        minimum: 3.2
      }, normalize({}))
      expect(res2).toBeGreaterThanOrEqual(3.2)
      expect(res2).toBeLessThanOrEqual(5.6)

      const res3 = TypeGenerators.number({
        type: 'number',
        maximum: 3.2,
        minimum: 5.6
      }, normalize({}))
      expect(res3).toBeNaN()
    }
  })
  it('should generate STRING correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const res1 = TypeGenerators.string({
        type: 'string'
      }, normalize({}))
      expect(res1.length).toBeGreaterThanOrEqual(MIN_LENGTH)
      expect(res1.length).toBeLessThanOrEqual(MAX_LENGTH)

      const res2 = TypeGenerators.string({
        type: 'string',
        maxLength: 6,
        minLength: 3
      }, normalize({}))
      expect(res2).toMatch(/[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789]{3,6}/)

      const res3 = TypeGenerators.string({
        type: 'string',
        maxLength: 3,
        minLength: 6
      }, normalize({}))
      expect(res3).toBe('')
    }
  })

  it('should generate ARRAY correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const schema1: JSONSchema6WithTarget = {
        type: 'array',
        target: []
      }
      const res1 = TypeGenerators.array(schema1, normalize({}))
      expect(res1.length).toBeGreaterThanOrEqual(MIN_ITEMS)
      expect(res1.length).toBeLessThanOrEqual(MAX_ITEMS)
      expect(schema1.target).toBe(res1)

      const schema2: JSONSchema6WithTarget = {
        type: 'array',
        items: [{
          type: 'integer',
          maximum: 5,
          minimum: 3
        }, {
          type: 'boolean'
        }, {
          type: 'string',
          maxLength: 5,
          minLength: 3
        }],
        target: []
      }
      const res2 = TypeGenerators.array(schema2, normalize({}))
      expect(res2).toHaveLength(3)
      expect(schema2.target).toBe(res2)
      expect(Number.isInteger(res2[0])).toBe(true)
      expect(res2[0]).toBeGreaterThanOrEqual(3)
      expect(res2[0]).toBeLessThanOrEqual(5)
      expect(typeof res2[1]).toBe('boolean')
      expect(res2[2]).toMatch(/[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789]{3,5}/)
    }
  })
  it('should generate OBJECT correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const schema1: JSONSchema6WithTarget = {
        type: 'object',
        target: {}
      }
      const res1 = TypeGenerators.object(schema1, normalize({}))
      expect(res1).toEqual({})
      expect(schema1.target).toBe(res1)

      const schema2: JSONSchema6WithTarget = {
        type: 'object',
        required: ['notExist'],
        target: {}
      }
      const res2 = TypeGenerators.object(schema2, normalize({}))
      expect(res2).toEqual({})
      expect(schema2.target).toBe(res2)

      const schema3: JSONSchema6WithTarget = {
        type: 'object',
        required: ['exist1', 'exist2', 'notExist', 'false'],
        properties: {
          exist1: {
            type: 'integer',
            maximum: 5,
            minimum: 3
          },
          exist2: {
            type: 'boolean'
          },
          notRequired: {
            type: 'string',
            maxLength: 5,
            minLength: 3
          },
          false: false
        },
        target: {}
      }
      const res3 = TypeGenerators.object(schema3, normalize({}))
      expect(res3).toHaveProperty('exist1')
      expect(res3).toHaveProperty('exist2')
      expect(Number.isInteger(res3.exist1)).toBe(true)
      expect(res3.exist1).toBeGreaterThanOrEqual(3)
      expect(res3.exist1).toBeLessThanOrEqual(5)
      expect(typeof res3.exist2).toBe('boolean')
      expect(res3).not.toHaveProperty('notRequired')
      expect(res3).not.toHaveProperty('notExist')
      expect(res3).not.toHaveProperty('false')
      expect(schema3.target).toBe(res3)
    }
  })
})

describe('Generator shrink test', () => {
  it('shrinks anyof to a subschema', () => {
    const schema: JSONSchema6 = {
      anyOf: [{
        type: 'string'
      }, {
        type: 'boolean'
      }]
    }
    const shrinked = shrink(schema)
    expect(shrinked).toHaveProperty('type')
    expect(shrinked).not.toHaveProperty('anyOf')
    expect(['string', 'boolean'].includes(shrinked.type)).toBe(true)
  })

  it('does not modify original schema', () => {
    const schema: JSONSchema6 = {
      anyOf: [{
        type: 'string'
      }, {
        type: 'boolean'
      }]
    }
    const shrinked = shrink(schema)
    expect(schema).toEqual({
      anyOf: [{
        type: 'string'
      }, {
        type: 'boolean'
      }]
    })
  })

  it('resolves nested anyof', () => {
    const schema: JSONSchema6 = {
      anyOf: [{
        anyOf: [{
          type: 'boolean'
        }]
      }]
    }
    const shrinked = shrink(schema)
    expect(shrinked).toEqual({
      type: 'boolean'
    })
  })

  it('deals with empty anyof correctly', () => {
    const schema: JSONSchema6 = {
      anyOf: []
    }
    const shrinked = shrink(schema)
    expect(shrinked).toHaveProperty('type')
    delete shrinked.type
    expect(shrinked).toEqual({})
  })

  it('merges properties properly', () => {
    const schema: JSONSchema6 = {
      type: 'number',
      anyOf: [{
        maximum: 5,
        minimum: 3,
        anyOf: [{
          minimum: 4
        }]
      }, {
        maximum: 1,
        minimum: -1,
        type: 'integer'
      }]
    }
    const shrinked = shrink(schema)
    if (shrinked.type === 'number') {
      expect(shrinked).toEqual({
        type: 'number',
        maximum: 5,
        minimum: 4
      })
    } else {
      expect(shrinked).toEqual({
        type: 'integer',
        maximum: 1,
        minimum: -1
      })
    }
  })
})

describe('Generator getConstOrEnum test', () => {
  it('handles const correctly', () => {
    const constObj = { foo: 'bar' }
    const schema: JSONSchema6 = {
      const: constObj
    }
    expect(getConstOrEnum(schema)).toBe(constObj)
  })

  it('handles enum correctly', () => {
    const enumArray = [{ foo: 'bar' }, { bar: 'baz' }]
    const schema: JSONSchema6 = {
      enum: enumArray
    }
    expect(enumArray.includes(<any>getConstOrEnum(schema))).toBe(true)
  })

  it('returns undifined when neither const nor enum exist', () => {
    const schema: JSONSchema6 = {
      type: 'boolean'
    }
    expect(getConstOrEnum(schema)).toBeUndefined()
  })
})

describe('Generator typeGenerate test', () => {
  it('handles promitive types correctly', () => {
    const schemas: JSONSchema6[] = [{
      type: 'boolean'
    }, {
      type: 'integer'
    }, {
      type: 'null'
    }, {
      type: 'number'
    }, {
      type: 'string'
    }]
    const resultTypes = ['boolean', 'number', 'object', 'number', 'string']
    for (let i = 0; i < 5; ++i) {
      const schema = schemas[i]
      const resultType = resultTypes[i]
      const result = typeGenerate(schema, normalize({}))
      expect(typeof result).toBe(resultType)
    }
  })

  it('deals with array correctly', () => {
    const schema: JSONSchema6 = {
      type: 'array'
    }
    const options = normalize({})
    const result = typeGenerate(schema, options)
    expect(result).toEqual([])
    expect(options.queue).toHaveLength(1)
    expect(options.queue[0].target).toBe(result)
  })

  it('deals with object correctly', () => {
    const schema: JSONSchema6 = {
      type: 'object'
    }
    const options = normalize({})
    const result = typeGenerate(schema, options)
    expect(result).toEqual({})
    expect(options.queue).toHaveLength(1)
    expect(options.queue[0].target).toBe(result)
  })
})

describe('Generator core test', () => {
  it('deals with nested array/object correctly', () => {
    const schema: JSONSchema6 = {
      items: {
        properties: {
          foo: {
            maxLength: 5,
            minLength: 3
          }
        },
        required: ['foo']
      },
      minItems: 4,
      maxItems: 4
    }
    const result = generate(schema, normalize({}))
    expect(result).toHaveLength(4)
    for (const obj of result) {
      expect(Object.keys(obj)).toEqual(['foo'])
      expect(obj.foo).toMatch(/[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789]{3,5}/)
    }
  })

  it('deals with top level const/enum/primitive correctly', () => {
    const schema1: JSONSchema6 = {
      const: 1
    }
    const result1 = generate(schema1, normalize({}))
    expect(result1).toBe(1)

    const schema2: JSONSchema6 = {
      enum: ['foo']
    }
    const result2 = generate(schema2, normalize({}))
    expect(result2).toBe('foo')

    const schema3: JSONSchema6 = {
      maximum: 4,
      minimum: 4
    }
    const result3 = generate(schema3, normalize({}))
    expect(result3).toBe(4)
  })
})
