// The one-tap standard, the guidance and the tag on each assumption input equal the original's.
import { describe, expect, it } from 'vitest'
import { allInputs, calculatorFor } from '../../src/components/calc/calculators'
import { guideFor, standardFor, standardTag } from '../../src/components/calc/guide'
import { TOOLS } from '../../src/components/explore/explore.data'
import fresh from '../fixtures/fresh.json'
import { original } from './golden'
import { calcContext } from '../../src/components/calc/context'
import { localToday } from '../../src/lib/today'
import { TODAY } from '../golden/origSlice'

const chose = {
  ...structuredClone(fresh),
  asm: { invGross: 0.06, mortRate: 0.04 },
  calcT: { fees: { a: true } },
}

describe.each([
  ['fresh', fresh],
  ['with choices', chose],
] as const)('%s', (_, plan) => {
  it.each(TOOLS.map((t) => t.id))('%s', (id) => {
    original.setState(structuredClone(plan))
    original.applyAssume()
    for (const { key } of allInputs(calculatorFor(id))) {
      const std = original.calcStd(id, key)
      const tag = original.stdTag(id, key)
      expect(standardFor(plan as never, id, key), key).toEqual(
        std && { value: std.v, text: std.t, suggested: !!std.sug },
      )
      expect(
        guideFor(plan as never, id, key, calcContext(plan as never, id, localToday(TODAY)).rules),
        key,
      ).toBe(original.calcGuide(id, key))
      expect(standardTag(plan as never, id, key), key).toBe(
        tag.includes('Your choice') ? 'mine' : tag.includes('Set by LifeMap') ? 'set' : null,
      )
    }
  })
})
