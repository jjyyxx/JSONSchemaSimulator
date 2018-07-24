import { getRandom, getRandomInt, getRandomElement } from '../src/util'

describe('Basic random utility', () => {
  it('should get random number in an inclusive range', () => {
    expect(getRandom(4.1, 4.1)).toBe(4.1)
    expect(getRandom(4.2, 4.1)).toBeNaN()
    for (let i = 0; i < 10; ++i) {
      expect(getRandom(3.2, 5.6)).toBeGreaterThanOrEqual(3.2)
      expect(getRandom(3.2, 5.6)).toBeLessThanOrEqual(5.6)
    }
  })
  it('should get random integer in an inclusive range', () => {
    expect(getRandomInt(4.1, 4.1)).toBeNaN()
    expect(getRandomInt(4, 4.1)).toBe(4)
    expect(getRandomInt(4.1, 5)).toBe(5)
    for (let i = 0; i < 10; ++i) {
      expect(getRandomInt(3.2, 5.6)).toBeGreaterThanOrEqual(4)
      expect(getRandomInt(3.2, 5.6)).toBeLessThanOrEqual(5)
      expect(getRandomInt(3, 5)).toBeGreaterThanOrEqual(3)
      expect(getRandomInt(3, 5)).toBeLessThanOrEqual(5)
      expect(Number.isInteger(getRandomInt(3.2, 5.6))).toBe(true)
    }
  })
  it('should get random element in an array', () => {
    const arr = new Array(10).fill(1)
    for (let i = 0; i < 10; ++i) {
      expect(getRandomElement(arr)).not.toBe(undefined)
    }
    const o = {}
    expect(getRandomElement([o])).toBe(o)
  })
})
