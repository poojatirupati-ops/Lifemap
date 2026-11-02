import { expect, test } from 'vitest'
import { origSlice, runOriginal } from '../golden/origSlice'
import { fresh, freshUi } from '../../src/state/fresh'
import { toOriginal } from '../../src/state/migrate'
import { useStore } from '../../src/state/store'
import { syncTotals } from '../../src/domain/finances/syncTotals'
import { assumption } from '../../src/domain/planning/assumptions'
import { plain } from '../golden/origProfile'
import type { ListItem, Plan } from '../../src/state/types'

test('fresh() and freshUi() deep-equal the original', () => {
  const {
    scr: _screen,
    sheet: _sheet,
    ask: _ask,
    toast: _toast,
    save: _save,
    ...proto
  } = origSlice().fresh()
  // Login-first (O-01) dropped the save sheet and the unverified mobile.
  const { mobile: _mobile, sv: _sv, ...acct } = proto.acct
  proto.acct = acct
  // The app stores whether the saving was capped (saveNote's only non-empty value), not the copy.
  const original = Object.fromEntries(
    Object.entries(proto).map(([key, value]) =>
      key === 'saveNote' ? ['savingCapped', value !== ''] : [key, value],
    ),
  )
  const { screen: _s, sheet: _h, ...ui } = freshUi()
  const plan = toOriginal(fresh())
  expect(toOriginal({ ...fresh(), ...ui })).toEqual(original)
  // the plan keeps the original's key order
  const inOrder = Object.keys(original).filter((key) => key in plan)
  const originalPlan = Object.fromEntries(inOrder.map((key) => [key, original[key]]))
  expect(JSON.stringify(plan)).toBe(JSON.stringify(originalPlan))
  expect(fresh().about).not.toBe(fresh().about)
})

function item(
  id: number,
  fields: ListItem['fields'],
  {
    source = 'typed',
    confidence = {},
    fixed = {},
  }: { source?: 'typed' | 'doc' } & Partial<ListItem> = {},
): ListItem {
  return {
    id,
    fields,
    sources: Object.fromEntries(Object.keys(fields).map((key) => [key, source])),
    confidence,
    manual: {},
    fixed,
    docFrom: null,
  }
}

function makeState(
  fin: Partial<Plan['figures']> = {},
  asm: Partial<Plan['assumptions']> = {},
): Plan {
  const state = fresh()
  state.lists = {
    // doc-sourced cards with differing conf and one fix flag: min(conf) and the fix branch are exercised
    cards: [
      item(
        1,
        { owed: 400, pay: 40, rate: 20 },
        { source: 'doc', confidence: { owed: 0.9, pay: 0.6, rate: 0.5 }, fixed: { owed: true } },
      ),
      item(2, { owed: 100, pay: 10 }, { source: 'doc', confidence: { owed: 0.7, pay: 0.8 } }),
    ],
    // three rated loans: unequal owed, plus one with owed blank (weight-1 fallback) -> weighted mean with long decimals
    loans: [
      item(
        5,
        { owed: 3000, pay: 90, rate: 7 },
        { source: 'doc', confidence: { owed: 0.8, pay: 0.8 } },
      ),
      item(6, { owed: 1000, pay: 30, rate: 3 }),
      item(8, { pay: 5, rate: 5 }),
    ],
    mort2: [item(7, { owed: 90000, pay: 500, rate: 4 })],
    pens: [item(3, { value: 5000, monthly: 200, own: 80 }), item(4, { value: 100, monthly: 100 })],
  }
  state.listsFedTotals = {}
  state.figures.mort2Bal = 9
  Object.assign(state.figures, fin)
  Object.assign(state.assumptions, asm)
  return state
}

const original = runOriginal('syncLists')

const inOriginalShape = (state: Plan) => plain(toOriginal(state))

/** Runs the original syncLists on a copy of the state, ours on the state itself, and compares. */
function compareWithOriginal(state: Plan) {
  original.setState(inOriginalShape(state))
  original.syncLists()
  syncTotals(state, assumption(state, 'ownShare'))
  expect(inOriginalShape(state)).toEqual(plain(original.getState()))
}

test.each([
  ['default 0.5', {}, {}, 0.5],
  ['Self-employed 1', { work: 'Self-employed' }, {}, 1],
  ['asm.ownShare set', {}, { ownShare: 0.3 }, 0.3],
])('syncLists matches the original: %s', (_name, fin, asm, ownShare) => {
  const state = makeState(fin, asm)
  compareWithOriginal(state)
  expect(state.figures.pensionOwnM).toBe(80 + 100 * ownShare)
  expect(state.confidence.cardBal).toBe(0.7)
  expect(state.fixed.cardBal).toBe(true)
})

// cleanup and conf branches the first scenario does not reach
test('syncLists matches the original: emptied list, stale typed rate, partial conf', () => {
  const state = makeState()
  const base = makeState().lists
  state.lists.cards = []
  state.listsFedTotals = { cards: true }
  Object.assign(state.figures, { cardBal: 50, cardPayM: 5, cardRate: 9 })
  Object.assign(state.sources, { cardBal: 'doc', cardRate: 'typed' })
  Object.assign(state.confidence, { cardBal: 0.5 })
  Object.assign(state.fixed, { cardBal: true })
  state.lists.loans = [{ ...base.loans[0], fields: { owed: 3000, pay: 90 } }]
  state.figures.loanRate = 9
  state.sources.loanRate = 'typed'
  const docOwedAndPay = { sources: { owed: 'doc', pay: 'doc' }, fields: { owed: 10, pay: 1 } }
  state.lists.mort2 = [
    { ...base.mort2[0], ...docOwedAndPay, confidence: { owed: 0.9 } },
    { ...base.mort2[0], ...docOwedAndPay, id: 9, confidence: { owed: 0.8, pay: 0.7 } },
  ]
  compareWithOriginal(state)
  expect(state.figures.cardBal).toBeUndefined()
  expect(state.listsFedTotals.cards).toBe(false)
  expect(state.figures.loanRate).toBeUndefined()
  expect(state.sources.loanRate).toBeUndefined()
  expect(state.confidence.mort2Bal).toBe(0.8)
  expect(state.confidence.mort2PayM).toBeUndefined()
})

// leftovers from a doc-sourced total meet typed or blank items; a doc rate with no rated item survives
test('syncLists matches the original: leftover conf/fix, doc rate kept, zero and non-numeric values', () => {
  const state = makeState()
  state.lists.cards = [item(1, { owed: 50, pay: 'abc' })]
  state.lists.loans = [item(1, { pay: 5, rate: 0 })]
  state.lists.pens = [
    item(1, { value: 1000, monthly: 0, own: 50 }),
    item(1, { value: 1, monthly: 100 }),
  ]
  for (const key of ['cardBal', 'cardPayM', 'loanBal']) {
    state.figures[key] = 7
    state.sources[key] = 'doc'
    state.confidence[key] = 0.5
    state.fixed[key] = true
  }
  state.figures.loanRate = 6
  state.sources.loanRate = 'doc'
  compareWithOriginal(state)
  expect(state.sources.cardBal).toBe('typed')
  expect(state.confidence.cardBal).toBeUndefined()
  expect(state.fixed.cardBal).toBeUndefined()
  for (const key of ['cardPayM', 'loanBal']) {
    expect(state.figures[key]).toBeUndefined()
    expect(state.confidence[key]).toBeUndefined()
    expect(state.fixed[key]).toBeUndefined()
  }
  expect(state.figures.loanRate).toBe(6)
  expect(state.figures.pensionOwnM).toBeUndefined()
})

test.each([
  [
    'own above monthly is capped',
    [
      { monthly: 200, own: 300 },
      { monthly: 100, own: 50 },
    ],
    250,
  ],
  ['all blank leaves own unset', [{ monthly: 200 }, { monthly: 100 }], undefined],
  ['typed own, no monthly: unset', [{ own: 50 }], undefined],
  ['one typed, one blank uses the share', [{ monthly: 200, own: 80 }, { monthly: 100 }], 130],
])('syncLists matches the original: pension %s', (_name, rows, own) => {
  const state = makeState()
  state.lists.pens = rows.map((fields, index) => ({
    ...item(index + 1, { value: 1000, ...fields }),
    sources: {},
  }))
  compareWithOriginal(state)
  expect(state.figures.pensionOwnM).toBe(own)
})

test('store update runs normalize and keeps state immutable', () => {
  const before = useStore.getState().plan
  useStore.getState().update((plan) => {
    plan.lists.cards = [item(1, { owed: 50 })]
  })
  const after = useStore.getState().plan
  expect(after.figures.cardBal).toBe(50)
  expect(before.figures.cardBal).toBeUndefined()
  expect(after).not.toBe(before)
})
