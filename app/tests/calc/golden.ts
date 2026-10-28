// Runs a calculator on both sides: the ORIGINAL's CALCS in node:vm and ours, on the same plan.
import { runOriginal, TODAY } from '../golden/origSlice'
import { plain } from '../golden/origProfile'
import fresh from '../fixtures/fresh.json'
import complete from '../fixtures/finances-complete.json'
import sample from '../../src/state/sample-plan.json'
import { calculatorFor, allInputs } from '../../src/components/calc/calculators'
import { calcContext, type CalcPlan } from '../../src/components/calc/context'
import type { Figures } from '../../src/components/calc/types'
import { localToday } from '../../src/lib/today'

export const original = runOriginal(
  'C, CALCS, applyAssume, calcVals, calcPre, calcMissing, calcIsExample, calcStd, calcGuide, stdTag, DOCT, pstConfirm, pstRemove, pstStart',
)

const withInflation = (state: any, infl: number | null) => ({ ...structuredClone(state), infl })

/** Plans to run every calculator on: inflation chosen or not, cautious growth, a customer with figures. */
export const PLANS: [name: string, plan: any][] = [
  ['fresh, no inflation', withInflation(fresh, null)],
  ['fresh, 2.5% inflation', withInflation(fresh, 0.025)],
  ['fresh, cautious, 4% inflation', { ...withInflation(fresh, 0.04), assume: 'cautious' }],
  ['finances complete', withInflation(complete, 0.02)],
  ['sample customer', withInflation(sample, 0.025)],
  [
    "today's money switched on",
    { ...withInflation(fresh, 0.03), adjInfl: { lumpsum: true, regularinvest: true } },
  ],
  [
    "today's money without inflation",
    { ...withInflation(fresh, null), adjInfl: { lumpsum: true, regularinvest: true } },
  ],
]

/** The tool's example figures, with what-ifs left out. */
export const exampleFigures = (id: string): Figures =>
  Object.fromEntries(calculatorFor(id).inputs.map((input) => [input.key, input.example]))

/** Every input at its min, its max, and a mid step, with what-ifs moved too. */
export function figureSets(id: string): Figures[] {
  const inputs = allInputs(calculatorFor(id))
  const at = (pick: (i: (typeof inputs)[number]) => number) =>
    Object.fromEntries(inputs.map((input) => [input.key, pick(input)]))
  return [
    exampleFigures(id),
    at((i) => i.example),
    at((i) => i.min),
    at((i) => i.max),
    at((i) => +(i.min + Math.round((i.max - i.min) / i.step / 3) * i.step).toFixed(4)),
  ]
}

/** Plain JSON with numbers to 10 significant digits: float order of operations may differ. */
export const rounded = (value: unknown) =>
  JSON.parse(
    JSON.stringify(plain(value), (_, v) => (typeof v === 'number' ? +v.toPrecision(10) : v)),
  )

export function runBoth(plan: CalcPlan, id: string, figures: Figures) {
  original.setState(structuredClone(plan))
  original.applyAssume()
  const theirs = rounded(original.C(id).run(structuredClone(figures)))
  const result = calculatorFor(id).run(figures, calcContext(plan, id, localToday(TODAY)))
  const ours = rounded({
    lbl: result.label,
    val: result.value,
    line: result.line,
    rows: result.rows,
    goal: result.goal,
    num: result.numbers,
  })
  return { theirs: { ...theirs, rows: theirs.rows.filter(Boolean) }, ours }
}
