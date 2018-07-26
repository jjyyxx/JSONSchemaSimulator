import { infer } from '../src/infer'
import { normalize } from '../src/options'

describe('Schema type inference', () => {
  it('should infer integer/number type correctly', () => {
    expect(infer({
      maximum: 2
    }, normalize({}))).toBe('integer')
    expect(infer({
      minimum: -2
    }, normalize({}))).toBe('integer')
    expect(infer({
      items: {}
    }, normalize({}))).not.toBe('integer')
  })
  it('should infer object type correctly', () => {
    expect(infer({
      required: ['foo']
    }, normalize({}))).toBe('object')
    expect(infer({
      properties: {
        foo: {}
      }
    }, normalize({}))).toBe('object')
    expect(infer({
      maxLength: 3
    }, normalize({}))).not.toBe('object')
  })
  it('should infer string type correctly', () => {
    expect(infer({
      maxLength: 20
    }, normalize({}))).toBe('string')
    expect(infer({
      minLength: 5
    }, normalize({}))).toBe('string')
    expect(infer({
      pattern: '.*'
    }, normalize({}))).toBe('string')
    expect(infer({
      additionalItems: {}
    }, normalize({}))).not.toBe('string')
  })
  it('should infer unrecognized types as any', () => {
    expect(infer({
      description: 'Hello'
    }, normalize({}))).toBe('any')
  })
})
