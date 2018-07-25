import Ajv from 'ajv'
import { JSONSchema6 } from 'json-schema'
import { load } from '../src/index'

describe('Library entrance test', () => {
  it('should resolve references correctly', async () => {
    const schemaWithRefs: JSONSchema6 = {
      definitions: {
        Element: {
          type: 'number'
        }
      },
      type: 'array',
      items: {
        $ref: '#/definitions/Element'
      }
    }
    const generator = await load(schemaWithRefs)
    expect(generator.schema.items).toBe(generator.schema.definitions.Element)
  })

  it('should be able to run infinitely', async () => {
    const schema: JSONSchema6 = {
      type: 'array',
      items: {
        type: 'number'
      }
    }
    const generator = await load(schema)
    for (let i = 0; i < 100; ++i) {
      expect(generator.generate()).toBeInstanceOf(Array)
    }
  })

  it('should be able to use forof and spread with limit provided', async () => {
    const schema: JSONSchema6 = {
      type: 'array',
      items: {
        type: 'number'
      }
    }
    const generator1 = await load(schema, {generationLimit: 20})
    for (const obj of generator1) {
      expect(obj).toBeInstanceOf(Array)
    }

    const generator2 = await load(schema, {generationLimit: 20})
    const arr = [...generator2]
    expect(arr).toHaveLength(20)

    const generator3 = await load(schema, {generationLimit: 0})
    expect([...generator3]).toEqual([])
  })
})

describe('Real scenario test', () => {
  it('should generate correct random data', async () => {
    const schema: JSONSchema6 = require('../test/schema.json')
    const generator = await load(schema)
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    for (let i = 0; i < 10; ++i) {
      expect(validate(generator.generate())).toBe(true)
    }
  })
})
