// The one-tap standard, the guidance and the tag on each assumption input equal the original's.
import { describe, expect, it } from 'vitest'
import { allInputs, calculatorFor } from '../../src/domain/calc/calculators'
import { guideFor, toolStandard, standardTag } from '../../src/domain/calc/guide'
import { TOOLS } from '../../src/components/explore/tools.data'
import fresh from '../fixtures/fresh.json'
import { original } from './golden'
import { calcContext, toolPlan } from '../../src/domain/calc/context'
import { localToday } from '../../src/lib/today'
import { fromOriginal } from '../../src/state/migrate'
import { TODAY } from '../golden/origSlice'

const chose = {
  ...structuredClone(fresh),
  asm: { invGross: 0.06, mortRate: 0.04 },
  calcT: { fees: { a: true } },
}

describe.each([
  ['fresh', fresh],
  ['with choices', chose],
] as const)('%s', (_, state) => {
  const plan = fromOriginal(state)
  it.each(TOOLS.map((t) => t.id))('%s', (id) => {
    original.setState(structuredClone(state))
    original.applyAssume()
    const tool = toolPlan(plan as never, plan as never, id)
    const { rules } = calcContext(tool, id, localToday(TODAY))
    for (const { key } of allInputs(calculatorFor(id))) {
      const std = original.calcStd(id, key)
      const tag = original.stdTag(id, key)
      expect(toolStandard(plan as never, id, key), key).toEqual(
        std && { value: std.v, text: std.t, suggested: !!std.sug },
      )
      expect(guideFor(plan as never, id, key, rules), key).toBe(original.calcGuide(id, key))
      expect(standardTag(tool, id, key), key).toBe(
        tag.includes('Your choice') ? 'mine' : tag.includes('Set by LifeMap') ? 'set' : null,
      )
    }
  })
})
