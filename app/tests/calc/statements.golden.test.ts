// Confirming and removing an Explore statement changes the plan as the original does.
import { describe, expect, it, vi } from 'vitest'
import { assumption } from '../../src/domain/planning/assumptions'
import { rulesFor } from '../../src/domain/planning/rates'
import { confirmStatement, removeStatement } from '../../src/domain/calc/statements'
import { normalize } from '../../src/domain/plan/normalize'
import { localToday } from '../../src/lib/today'
import { fromOriginal, toOriginal } from '../../src/state/migrate'
import { TODAY } from '../golden/origSlice'
import fresh from '../fixtures/fresh.json'
import complete from '../fixtures/finances-complete.json'
import sample from '../../src/state/sample-plan.json'
import { original, rounded } from './golden'

// slow when the machine is busy: the original runs in node:vm
vi.setConfig({ testTimeout: 30000 })

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

    const plan: any = fromOriginal(structuredClone(state))
    normalize(plan, localToday(TODAY))
    const rules = rulesFor(assumption(plan, 'startYear', localToday(TODAY)))
    confirmStatement(plan, upload, rules)
    normalize(plan, localToday(TODAY))
    expect(picked(toOriginal(plan))).toEqual(picked(theirs))

    original.pstRemove(cat)
    removeStatement(plan, cat, rules)
    normalize(plan, localToday(TODAY))
    expect(picked(toOriginal(plan))).toEqual(picked(original.getState()))
  })
})
