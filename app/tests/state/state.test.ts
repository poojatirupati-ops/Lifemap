import { expect, test } from 'vitest'
import { origSlice, runOriginal } from '../golden/origSlice'
import { fresh } from '../../src/state/fresh'
import { useStore } from '../../src/state/store'
import { syncTotals } from '../../src/domain/finances/syncTotals'
import { assumption } from '../../src/domain/planning/assumptions'
import { plain } from '../golden/origProfile'
import type { ListItem, Plan } from '../../src/state/types'

test('fresh() deep-equals the original (same key order)', () => {
  const { scr: _screen, sheet: _sheet, ...original } = origSlice().fresh()
  const mine = fresh()
  expect(mine).toEqual(original)
  expect(JSON.stringify(mine)).toBe(JSON.stringify(original))
  expect(mine.about).not.toBe(fresh().about)
})

function item(
  id: number,
  fields: ListItem['f'],
  { source = 'typed', conf = {}, fix = {} }: { source?: 'typed' | 'doc' } & Partial<ListItem> = {},
): ListItem {
  return {
    id,
    f: fields,
    src: Object.fromEntries(Object.keys(fields).map((key) => [key, source])),
    conf,
    man: {},
    fix,
    docFrom: null,
  }
}

function makeState(fin: Partial<Plan['fin']> = {}, asm: Partial<Plan['asm']> = {}): Plan {
  const state = fresh()
  state.lists = {
    // doc-sourced cards with differing conf and one fix flag: min(conf) and the fix branch are exercised
    cards: [
      item(
        1,
        { owed: 400, pay: 40, rate: 20 },
        { source: 'doc', conf: { owed: 0.9, pay: 0.6, rate: 0.5 }, fix: { owed: true } },
      ),
      item(2, { owed: 100, pay: 10 }, { source: 'doc', conf: { owed: 0.7, pay: 0.8 } }),
    ],
    // three rated loans: unequal owed, plus one with owed blank (weight-1 fallback) -> weighted mean with long decimals
    loans: [
      item(5, { owed: 3000, pay: 90, rate: 7 }, { source: 'doc', conf: { owed: 0.8, pay: 0.8 } }),
      item(6, { owed: 1000, pay: 30, rate: 3 }),
      item(8, { pay: 5, rate: 5 }),
    ],
    mort2: [item(7, { owed: 90000, pay: 500, rate: 4 })],
    pens: [item(3, { value: 5000, monthly: 200, own: 80 }), item(4, { value: 100, monthly: 100 })],
  }
  state.listsFedTotals = {}
  state.fin.mort2Bal = 9
  Object.assign(state.fin, fin)
  Object.assign(state.asm, asm)
  return state
}

const original = runOriginal('syncLists')

/** Our state under the original's field names (listsFedTotals was dv). */
function inOriginalShape({ listsFedTotals, ...rest }: Plan) {
  return plain({ ...rest, dv: listsFedTotals })
}

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
  expect(state.fin.pensionOwnM).toBe(80 + 100 * ownShare)
  expect(state.conf.cardBal).toBe(0.7)
  expect(state.fix.cardBal).toBe(true)
})

// cleanup and conf branches the first scenario does not reach
test('syncLists matches the original: emptied list, stale typed rate, partial conf', () => {
  const state = makeState()
  const base = makeState().lists
  state.lists.cards = []
  state.listsFedTotals = { cards: true }
  Object.assign(state.fin, { cardBal: 50, cardPayM: 5, cardRate: 9 })
  Object.assign(state.src, { cardBal: 'doc', cardRate: 'typed' })
  Object.assign(state.conf, { cardBal: 0.5 })
  Object.assign(state.fix, { cardBal: true })
  state.lists.loans = [{ ...base.loans[0], f: { owed: 3000, pay: 90 } }]
  state.fin.loanRate = 9
  state.src.loanRate = 'typed'
  const docOwedAndPay = { src: { owed: 'doc', pay: 'doc' }, f: { owed: 10, pay: 1 } }
  state.lists.mort2 = [
    { ...base.mort2[0], ...docOwedAndPay, conf: { owed: 0.9 } },
    { ...base.mort2[0], ...docOwedAndPay, id: 9, conf: { owed: 0.8, pay: 0.7 } },
  ]
  compareWithOriginal(state)
  expect(state.fin.cardBal).toBeUndefined()
  expect(state.listsFedTotals.cards).toBe(false)
  expect(state.fin.loanRate).toBeUndefined()
  expect(state.src.loanRate).toBeUndefined()
  expect(state.conf.mort2Bal).toBe(0.8)
  expect(state.conf.mort2PayM).toBeUndefined()
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
    state.fin[key] = 7
    state.src[key] = 'doc'
    state.conf[key] = 0.5
    state.fix[key] = true
  }
  state.fin.loanRate = 6
  state.src.loanRate = 'doc'
  compareWithOriginal(state)
  expect(state.src.cardBal).toBe('typed')
  expect(state.conf.cardBal).toBeUndefined()
  expect(state.fix.cardBal).toBeUndefined()
  for (const key of ['cardPayM', 'loanBal']) {
    expect(state.fin[key]).toBeUndefined()
    expect(state.conf[key]).toBeUndefined()
    expect(state.fix[key]).toBeUndefined()
  }
  expect(state.fin.loanRate).toBe(6)
  expect(state.fin.pensionOwnM).toBeUndefined()
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
    src: {},
  }))
  compareWithOriginal(state)
  expect(state.fin.pensionOwnM).toBe(own)
})

test('store update runs normalize and keeps state immutable', () => {
  const before = useStore.getState().plan
  useStore.getState().update((plan) => {
    plan.lists.cards = [item(1, { owed: 50 })]
  })
  const after = useStore.getState().plan
  expect(after.fin.cardBal).toBe(50)
  expect(before.fin.cardBal).toBeUndefined()
  expect(after).not.toBe(before)
})

test('named actions: switchTab, openAsk, wallVisitor', () => {
  const { switchTab, openAsk, wallVisitor } = useStore.getState()
  useStore.getState().update((plan) => {
    plan.fsec = 2
  })
  openAsk()
  expect(useStore.getState()).toMatchObject({ sheet: 'ask', plan: { ask: { log: [] } } })
  switchTab('plan')
  expect(useStore.getState()).toMatchObject({
    sheet: null,
    plan: { tab: 'plan', planGo: 'timeline', fsec: null },
  })
  wallVisitor({ from: 'F2' })
  expect(useStore.getState()).toMatchObject({ screen: 'P1', plan: { from: 'F2' } })
})
