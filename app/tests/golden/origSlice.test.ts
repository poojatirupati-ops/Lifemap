import { expect, test } from 'vitest'
import { origSlice } from './origSlice'

test('original slice runs: RULES, fresh and loadSample', () => {
  const original = origSlice()
  expect(original.RULES.it.r1.v).toBe(0.2)
  expect(original.fresh().scr).toBe('D0')
  original.loadSample()
  expect(original.getState().acct.name).toBe('Aoife')
})
