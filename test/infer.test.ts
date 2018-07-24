import { infer } from '../src/infer'

describe('Schema type inference', () => {
  it('should infer integer type correctly', () => {
    expect(infer({
      maximum: 2
    })).toBe('integer')
  })
})
