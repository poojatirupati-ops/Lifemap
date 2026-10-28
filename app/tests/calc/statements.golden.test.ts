// Confirming and removing an Explore statement changes the plan as the original does.
import { describe, expect, it } from 'vitest'
import { calcContext } from '../../src/components/calc/context'
import { confirmStatement, removeStatement } from '../../src/components/calc/statements'
import { normalize } from '../../src/domain/plan/normalize'
import { localToday } from '../../src/lib/today'
import { TODAY } from '../golden/origSlice'
import fresh from '../fixtures/fresh.json'
import complete from '../fixtures/finances-complete.json'
import sample from '../../src/state/sample-plan.json'
import { original, rounded } from './golden'

const KEYS = [
  'fin',
  'src',
  'conf',
  'fix',
  'docOf',
  'look',
  'man',
  'pdocs',
  'calcDoc',
  'calcSrc',
  'calcT',
]
const picked = (plan: any) => rounded(Object.fromEntries(KEYS.map((key) => [key, plan[key] ?? {}])))
const EDITS: [string, Record<string, string>][] = [
  ['as read', {}],
  ['corrected', { pot: '80000', bal: '199000', tot: '7000', prsi: '40', rate: '4.1' }],
  ['optional cleared', { proj: '', chg: '', hval: '', sh: ' ' }],
]

describe.each([
  ['fresh', fresh],
  ['finances complete', complete],
  ['sample customer', sample],
] as const)('%s', (_, state) => {
  it.each(
    ['retire', 'home', 'invest'].flatMap((cat) =>
      EDITS.map(([name, edit]) => [cat, name, edit] as const),
    ),
  )('%s statement, %s', (cat, _name, edit) => {
    const upload = { cat, stage: 'confirm' as const, files: ['a.pdf'], edit }
    original.setState({ ...structuredClone(state), pst: structuredClone(upload), xs: [] })
    original.applyAssume()
    original.pstConfirm()
    const theirs = original.getState()

    const plan: any = structuredClone(state)
    normalize(plan, localToday(TODAY))
    const rules = calcContext(plan, 'retirement', localToday(TODAY)).rules
    confirmStatement(plan, upload, rules)
    normalize(plan, localToday(TODAY))
    expect(picked(plan)).toEqual(picked(theirs))

    original.pstRemove(cat)
    removeStatement(plan, cat, rules)
    normalize(plan, localToday(TODAY))
    expect(picked(plan)).toEqual(picked(original.getState()))
  })
})
