import { normalize } from '../src/options'

describe('option utility', () => {
  it('normalize option objects correctly', () => {
    const normalized1 = normalize({})
    expect(normalized1.generationLimit).toBe(-1)

    const normalized2 = normalize({generationLimit: 1})
    expect(normalized1.generationLimit).toBe(1)

    const normalized3 = normalize({foo: 1})
    expect(normalized1).toEqual({
      generationLimit: -1,
      queue: []
    })
  })
})
