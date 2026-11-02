// Each calculator's result (headline, sentence, rows, plan hand-off, workbook numbers) equals the original's.
import { describe, expect, it } from 'vitest'
import { TOOLS } from '../../src/components/explore/tools.data'
import { exampleFigures, figureSets, original, PLANS, runBoth } from './golden'

describe.each(TOOLS.map((t) => t.id))('%s', (id) => {
  it.each(PLANS)('equals the original on %s', (_, plan) => {
    for (const figures of figureSets(id)) {
      const { theirs, ours } = runBoth(plan, id, figures)
      expect(ours, JSON.stringify(figures)).toEqual(theirs)
    }
  })
})

describe('retirement with a pension statement', () => {
  const withStatement = (projToday?: string) => {
    original.setState({
      ...structuredClone(PLANS[1][1]),
      pst: { cat: 'retire', stage: 'confirm', files: [], edit: {} },
      xs: [],
    })
    original.applyAssume()
    original.pstConfirm()
    const plan = structuredClone(original.getState())
    if (projToday) plan.pdocs.retire.v.projToday = projToday
    return plan
  }
  it.each([undefined, 'Yes'])('uses its projection at its retirement age (today: %s)', (today) => {
    const plan = withStatement(today)
    for (const ra of [66, 65]) {
      const figures = { ...exampleFigures('retirement'), ra, more: 0 }
      const { theirs, ours } = runBoth(plan, 'retirement', figures)
      expect(ours).toEqual(theirs)
    }
  })
})

// The Loans calculators' branches: the card's own minimum rule, payments below it, never clearing,
// spare money with and without saving, offers that cost the same, and the debt plan's notes.
const card = { b: 3000, apr: 21, p: 150, mp: 0, mf: 0, t: 36 }
const debts = {
  b1: 4500,
  apr1: 21,
  m1: 135,
  b2: 2000,
  apr2: 8,
  m2: 90,
  b3: 9000,
  apr3: 9,
  m3: 220,
  x: 100,
}
const afford = { inc: 3000, ess: 1800, debt: 200, sav: 0, apr: 9, y: 5, share: 70 }
const LOAN_CASES: [id: string, name: string, figures: Record<string, number>][] = [
  ['creditcard', 'no minimum rule entered', card],
  ['creditcard', "the card's rule", { ...card, mp: 3, mf: 6.35 }],
  ['creditcard', 'a payment below the minimum', { ...card, p: 60, mp: 3, mf: 6.35 }],
  ['creditcard', 'a lowest amount only', { ...card, mf: 25 }],
  ['creditcard', 'a share and no lowest amount', { ...card, mp: 2 }],
  ['creditcard', 'a minimum that never covers the interest', { ...card, apr: 35, mf: 20 }],
  ['creditcard', 'a payment that never covers the interest', { ...card, p: 40, mp: 1 }],
  ['creditcard', 'a high APR', { ...card, apr: 32, mp: 3, mf: 6.35 }],
  ['loanafford', 'no saving', afford],
  ['loanafford', 'saving kept', { ...afford, sav: 300 }],
  ['loanafford', 'no spare money', { ...afford, inc: 2000, sav: 100 }],
  ['loanafford', 'all of it used', { ...afford, share: 100 }],
  ['loancompare', 'the longer term costs more', { a: 15000, apr1: 9, y1: 5, apr2: 7.5, y2: 7 }],
  ['loancompare', 'the same offer', { a: 15000, apr1: 9, y1: 5, apr2: 9, y2: 5 }],
  ['loancompare', 'cheaper and lower monthly', { a: 15000, apr1: 9, y1: 5, apr2: 6, y2: 5 }],
  ['debtpay', 'paying extra', { b: 5000, apr: 20, p: 250, x: 50 }],
  ['debtpay', 'extra on a debt that never clears', { b: 5000, apr: 35, p: 50, x: 50 }],
  ['debtplan', 'three debts and an extra', debts],
  ['debtplan', 'no extra', { ...debts, x: 0 }],
  ['debtplan', 'a debt with no repayment', { ...debts, m2: 0 }],
  ['debtplan', 'debts that never clear', { ...debts, apr3: 35, m3: 10, x: 0 }],
  ['debtplan', 'no debts', { ...debts, b1: 0, b2: 0, b3: 0 }],
]

describe('Loans calculators', () => {
  it.each(LOAN_CASES)('%s equals the original: %s', (id, _, figures) => {
    const { theirs, ours } = runBoth(PLANS[0][1], id, figures)
    expect(ours).toEqual(theirs)
  })
})
