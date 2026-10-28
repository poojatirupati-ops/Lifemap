// A tool's starting figures, what still gates its result and the example label equal the original's.
import { describe, expect, it } from 'vitest'
import { TOOLS } from '../../src/components/explore/explore.data'
import { missingFigures, showsExample, toolFigures } from '../../src/components/calc/values'
import { normalize } from '../../src/domain/plan/normalize'
import { localToday } from '../../src/lib/today'
import { TODAY } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import { original, rounded } from './golden'

const withChoices = (plan: any) => ({
  ...structuredClone(plan),
  infl: 0.025,
  asm: { ...plan.asm, planEnd: 92, mortRate: 0.04, cardRate: 0.18 },
  calcT: { borrow: { inc: true }, fees: { a: true } },
  calcV: { borrow: { inc: 99000 }, fees: { a: 0.75 } },
})

const plans = fixtures.flatMap(([name, plan]) => [
  [name, plan],
  [name + ' with choices', withChoices(plan)],
])

describe.each(plans)('%s', (_, state) => {
  it.each(TOOLS.map((t) => t.id))('%s starts from the same figures', (id) => {
    original.setState(structuredClone(state))
    original.applyAssume()
    const calculator = original.C(id)
    const theirs = rounded(original.calcVals(calculator))
    const theirMissing = original.calcMissing(calculator)
    const theirExample = original.calcIsExample(calculator)

    const plan = structuredClone(state)
    normalize(plan, localToday(TODAY))
    expect(rounded(toolFigures(plan, id).figures)).toEqual(theirs)
    expect(missingFigures(plan, id)).toEqual(theirMissing)
    expect(showsExample(plan, id)).toBe(theirExample)
  })
})
