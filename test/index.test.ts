import { load } from '../src/index'
import { JSONSchema6 } from 'json-schema'

describe('Library entrance test', () => {
  it('should resolve references correctly', async () => {
    const schemaWithRefs: JSONSchema6 = {
      definitions: {
        Element: {
          type: 'number'
        }
      },
      type: "array",
      items: {
        "$ref": "#/definitions/Element"
      }
    }
    const generator = await load(schemaWithRefs)
    expect(generator.schema.items).toBe(generator.schema.definitions.Element)
  })

  it('should be able to run infinitely', async () => {
    const schema: JSONSchema6 = {
      type: "array",
      items: {
        type: 'number'
      }
    }
    const generator = await load(schema)
    for (let i = 0; i < 100; ++i) expect(generator.generate()).toBeInstanceOf(Array)
  })

  it('should be able to use forof and spread with limit provided', async () => {
    const schema: JSONSchema6 = {
      type: "array",
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
