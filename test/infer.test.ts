import { infer } from '../src/infer'

describe('Schema type inference', () => {
  it('should infer integer/number type correctly', () => {
    expect(infer({
      maximum: 2
    })).toBe('integer')
    expect(infer({
      minimum: -2
    })).toBe('integer')
    expect(infer({
      items: {}
    })).not.toBe('integer')
  })
  it('should infer object type correctly', () => {
    expect(infer({
      required: ['foo']
    })).toBe('object')
    expect(infer({
      properties: {
        foo: {}
      }
    })).toBe('object')
    expect(infer({
      maxLength: 3
    })).not.toBe('object')
  })
  it('should infer string type correctly', () => {
    expect(infer({
      maxLength: 20
    })).toBe('string')
    expect(infer({
      minLength: 5
    })).toBe('string')
    expect(infer({
      pattern: '.*'
    })).toBe('string')
    expect(infer({
      additionalItems: {}
    })).not.toBe('string')
  })
  it('should infer unrecognized types as any', () => {
    expect(infer({
      description: 'Hello'
    })).toBe('any')
  })
})
