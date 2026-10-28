import { expect, test } from 'vitest'
import { euro, euroShort, euroWeekly, percent, hasValue } from '../../src/lib/format'
import { origSlice } from './origSlice'

const original = origSlice()
const amounts = [
  0,
  1,
  -1,
  999.5,
  1234.4,
  -1234.5,
  99999,
  100000,
  999999,
  1e6,
  1.26e6,
  2.5e7,
  299.3,
  254,
  0.1 + 0.2,
  -0.4,
]

test.each(amounts)('money and percent text equal the original for %d', (amount) => {
  expect(euro(amount)).toBe(original.eur(amount))
  expect(euroShort(amount)).toBe(original.eurK(amount))
  expect(euroWeekly(amount)).toBe(original.eurW(amount))
  expect(percent(amount / 100)).toBe(original.pcs(amount / 100))
})

test('hasValue', () => {
  expect([0, 'a', false].map(hasValue)).toEqual([true, true, true])
  expect([null, undefined, '', NaN].map(hasValue)).toEqual([false, false, false, false])
})
