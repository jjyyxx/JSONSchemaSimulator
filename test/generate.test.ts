import { TypeGenerators, JSONSchema6WithTarget } from '../src/generate'
import { MAX_INTEGER, MIN_INTEGER, MIN_NUMBER, MAX_NUMBER, MIN_LENGTH, MAX_LENGTH, MIN_ITEMS, MAX_ITEMS, MAX_LEVELS, ENV } from '../src/config'
import { JSONSchema6 } from 'json-schema'

describe('Generator core test', () => {
  it('should generate BOOLEAN correctly', () => {
    expect(typeof TypeGenerators.boolean({}, [])).toBe('boolean')
  })
  it('should generate INTEGER correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const res1 = TypeGenerators.integer({
        type: 'integer'
      }, [])
      expect(Number.isInteger(res1)).toBe(true)
      expect(res1).toBeGreaterThanOrEqual(MIN_INTEGER)
      expect(res1).toBeLessThanOrEqual(MAX_INTEGER)

      const res2 = TypeGenerators.integer({
        type: 'integer',
        maximum: 3,
        minimum: 2
      }, [])
      expect(Number.isInteger(res2)).toBe(true)
      expect(res2).toBeGreaterThanOrEqual(2)
      expect(res2).toBeLessThanOrEqual(3)

      const res3 = TypeGenerators.integer({
        type: 'integer',
        maximum: 2,
        minimum: 3
      }, [])
      expect(res3).toBeNaN()
    }
  })
  it('should generate NULL correctly', () => {
    expect(TypeGenerators.null({}, [])).toBeNull()
  })
  it('should generate NUMBER correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const res1 = TypeGenerators.number({
        type: 'number'
      }, [])
      expect(res1).toBeGreaterThanOrEqual(MIN_NUMBER)
      expect(res1).toBeLessThanOrEqual(MAX_NUMBER)

      const res2 = TypeGenerators.number({
        type: 'number',
        maximum: 5.6,
        minimum: 3.2
      }, [])
      expect(res2).toBeGreaterThanOrEqual(3.2)
      expect(res2).toBeLessThanOrEqual(5.6)

      const res3 = TypeGenerators.number({
        type: 'number',
        maximum: 3.2,
        minimum: 5.6
      }, [])
      expect(res3).toBeNaN()
    }
  })
  it('should generate STRING correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const res1 = TypeGenerators.string({
        type: 'string'
      }, [])
      expect(res1.length).toBeGreaterThanOrEqual(MIN_LENGTH)
      expect(res1.length).toBeLessThanOrEqual(MAX_LENGTH)

      const res2 = TypeGenerators.string({
        type: 'string',
        maxLength: 6,
        minLength: 3
      }, [])
      expect(res2).toMatch(/[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789]{3,6}/)

      const res3 = TypeGenerators.string({
        type: 'string',
        maxLength: 3,
        minLength: 6
      }, [])
      expect(res3).toBe('')
    }
  })

  it('should generate ARRAY correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const schema1: JSONSchema6WithTarget = {
        type: 'array',
        target: []
      }
      const res1 = TypeGenerators.array(schema1, [])
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
      const res2 = TypeGenerators.array(schema2, [])
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
      const res1 = TypeGenerators.object(schema1, [])
      expect(res1).toEqual({})
      expect(schema1.target).toBe(res1)

      const schema2: JSONSchema6WithTarget = {
        type: 'object',
        required: ['notExist'],
        target: {}
      }
      const res2 = TypeGenerators.object(schema2, [])
      expect(res2).toEqual({})
      expect(schema2.target).toBe(res2)
      
      const schema3: JSONSchema6WithTarget = {
        type: 'object',
        required: ['exist1', 'exist2', 'notExist'],
        properties: {
          'exist1': {
            type: 'integer',
            maximum: 5,
            minimum: 3
          },
          'exist2': {
            type: 'boolean'
          },
          'notRequired': {
            type: 'string',
            maxLength: 5,
            minLength: 3
          }
        },
        target: {}
      }
      const res3 = TypeGenerators.object(schema3, [])
      expect(res3).toHaveProperty('exist1')
      expect(res3).toHaveProperty('exist2')
      expect(Number.isInteger(res3.exist1)).toBe(true)
      expect(res3.exist1).toBeGreaterThanOrEqual(3)
      expect(res3.exist1).toBeLessThanOrEqual(5)
      expect(typeof res3.exist2).toBe('boolean')
      expect(res3).not.toHaveProperty('notRequired')
      expect(res3).not.toHaveProperty('notExist')
      expect(schema3.target).toBe(res3)
    }
  })

  it('should generate ANY correctly', () => {
    for (let i = 0; i < 20; ++i) {
      const schema: JSONSchema6WithTarget = {
        type: 'any',
        target: [] 
      }
      const res = TypeGenerators.any(schema, [])
      expect(res).not.toBeUndefined()
      expect(res).not.toBeInstanceOf(Object)
    }
  })
})
