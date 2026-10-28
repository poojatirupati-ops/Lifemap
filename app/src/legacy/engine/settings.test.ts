import { expect, test } from 'vitest'
import { GUIDANCE, NO_STANDARD, STANDARDS, backToStandard, choose, invNet, isLaw, pick, resolve, suggestion } from './settings.ts'

const credit = { name: 'Acme Credit Union', values: { mortRate: 0.031, wage: 0.025, planEnd: 90 } }

test('law values reject edits and resolve fixed', () => {
  expect(isLaw('it.band')).toBe(true)
  expect(() => choose({}, 'it.band', 1)).toThrow()
  expect(resolve('it.band', { 'it.band': 1 })).toMatchObject({ value: 44000, editable: false, owner: 'law' })
})

test('standards apply from the start; customer choice and reset', () => {
  expect(resolve('wage')).toMatchObject({ value: 0.03, label: 'Set by LifeMap' })
  const mine = choose({}, 'wage', 0.04)
  expect(resolve('wage', mine)).toMatchObject({ value: 0.04, label: 'Your choice' })
  expect(resolve('wage', backToStandard(mine, 'wage'))).toMatchObject({ value: 0.03 })
})

test('partner override changes suggestion and label', () => {
  expect(suggestion('mortRate')!.value).toBe(0.0348)
  expect(suggestion('mortRate', credit)).toEqual({ value: 0.031, label: 'Suggested by Acme Credit Union' })
  expect(resolve('wage', {}, credit)).toMatchObject({ value: 0.025, label: 'Suggested by Acme Credit Union' })
})

test('market rates never pre-filled; no suggestion without a published source', () => {
  expect(resolve('mortRate').value).toBeUndefined()
  expect(suggestion('buyFees')).toBeNull()
  expect(suggestion('cardRate')).toBeNull()
})

test('retirement age and plan-until never resolve to a default', () => {
  for (const k of NO_STANDARD) {
    expect(k in STANDARDS).toBe(false)
    expect(resolve(k).value).toBeUndefined()
    expect(resolve(k, {}, credit).value).toBeUndefined()
    expect(GUIDANCE[k]).toBeTruthy()
  }
  expect(resolve('planEnd', choose({}, 'planEnd', 92)).value).toBe(92)
})

test('derived investment standard follows the partner block and the customer figures', () => {
  expect(resolve('inv')).toMatchObject({ value: invNet(0.05, 0.01), label: 'Set by LifeMap' })
  expect(resolve('inv').by).toContain('5% before fees and tax, less about 1% charges')
  const p = { name: 'Acme', values: { fundChg: 0.02, invGross: 0.07 } }
  const r = resolve('inv', {}, p)
  expect(r).toMatchObject({ value: invNet(0.07, 0.02), label: 'Suggested by Acme' })
  expect(r.by).toContain('7% before fees and tax, less about 2% charges')
  expect(resolve('inv', { fundChg: 0.005 }).value).toBe(invNet(0.05, 0.005))
  expect(invNet(0.07, 0.02)).not.toBe(invNet(0.05, 0.01))
})

test('inflation is never defaulted: a suggestion chip until the customer chooses', () => {
  expect(resolve('infl').value).toBeUndefined()
  expect(resolve('infl', {}, credit).value).toBeUndefined()
  expect(suggestion('infl')!.value).toBe(0.02)
  expect(resolve('infl', choose({}, 'infl', 0.02))).toMatchObject({ value: 0.02, label: 'Your choice' })
})

test('keys never walk the prototype chain', () => {
  for (const k of ['toString', '__proto__', 'constructor']) {
    expect(resolve(k)).toMatchObject({ value: undefined, owner: 'none' })
    expect(resolve(k, {}, { name: 'X', values: {} }).value).toBeUndefined()
    expect(() => choose({}, k, 1)).toThrow()
  }
})

test('choose validates key and value shape', () => {
  expect(() => choose({}, 'zzz', 1)).toThrow()
  expect(() => choose({}, 'wage', NaN)).toThrow()
  expect(() => choose({}, 'wage', 'abc')).toThrow()
  expect(() => choose({}, 'budget', [1, 2])).toThrow()
  expect(() => choose({}, 'bands', {})).toThrow()
  expect(choose({}, 'budget', [0.4, 0.4, 0.2]).budget).toEqual([0.4, 0.4, 0.2])
  expect(choose({}, 'bands', 'flat').bands).toBe('flat')
  expect(choose({}, 'retireAge', 62).retireAge).toBe(62)
})

test('law label carries the year; guidance has a source and an as-at', () => {
  expect(resolve('it.band').label).toBe('Set by Government · 2026')
  for (const k of NO_STANDARD) { expect(GUIDANCE[k].src).toBeTruthy(); expect(GUIDANCE[k].asat).toBeTruthy() }
  expect(GUIDANCE.planEnd.src).toContain('CSO')
})

test('partner override of a market rate with no published base', () => {
  const p = { name: 'Acme', values: { cardRate: 0.19, buyFees: 3000 } }
  expect(suggestion('cardRate', p)).toEqual({ value: 0.19, label: 'Suggested by Acme' })
  expect(suggestion('buyFees', p)).toEqual({ value: 3000, label: 'Suggested by Acme' })
})

test('precedence: document > typed > plan > example', () => {
  expect(pick({ example: 1, plan: 2, typed: 3, document: 4 })).toEqual({ value: 4, from: 'document' })
  expect(pick({ example: 1, plan: 2 })).toEqual({ value: 2, from: 'plan' })
  expect(pick({})).toBeNull()
})

test('range limits and types hold at the boundaries', () => {
  for (const [k, v] of [['lumpSum', 0.9], ['wage', 5000], ['infl', -3], ['retireAge', -5], ['planEnd', 120]] as const) expect(() => choose({}, k, v)).toThrow()
  expect(choose({}, 'lumpSum', 0.25).lumpSum).toBe(0.25)
  expect(resolve('lumpSum', {}, { name: 'X', values: { lumpSum: 0.9 } }).value).toBe(0.25)
  expect(resolve('inv', {}, { name: 'X', values: { inv: 'abc' } }).label).toBe('Set by LifeMap')
  expect(suggestion('infl', { name: 'X', values: { infl: 0.5 } })?.value).toBe(0.02)
})

test('derived inv from the customer own figures reads Your choice', () => {
  expect(resolve('inv', { invGross: 0.07 }).label).toBe('Your choice')
  expect(resolve('inv', { fundChg: 0.02 }).label).toBe('Your choice')
})

test('choice, pct3 and whole-year limits, for choose and for partner figures', () => {
  for (const [k, v] of [['accessAge', 'abc'], ['accessAge', 5000], ['bands', 99], ['bands', 'wages'], ['riskMu', [9, 9, 9]], ['budget', [5, 5, 5]], ['budget', [0.5, 0.5, 0.5]], ['planEnd', 85.7], ['retireAge', 62.5], ['style', 2.5]] as const) expect(() => choose({}, k, v)).toThrow()
  expect(choose({}, 'accessAge', 50).accessAge).toBe(50)
  expect(choose({}, 'riskMu', [0.01, 0.03, 0.08]).riskMu).toEqual([0.01, 0.03, 0.08])
  expect(resolve('inv', {}, { name: 'X', values: { inv: 0.04 } }).by).not.toContain('5%')
  const bad = { name: 'X', values: { riskMu: [9, 9, 9], bands: 3, accessAge: 5000, planEnd: 85.5 } }
  expect(resolve('riskMu', {}, bad)).toMatchObject({ value: [0.02, 0.04, 0.06], label: 'Set by LifeMap' })
  expect(resolve('bands', {}, bad).label).toBe('Set by LifeMap')
  expect(resolve('accessAge', {}, bad).value).toBe(60)
})

test('invalid stored custom values fall through; float noise at a limit is accepted', () => {
  expect(resolve('wage', { wage: 'bad' })).toMatchObject({ value: 0.03, label: 'Set by LifeMap' })
  expect(resolve('infl', { infl: 9 }).value).toBeUndefined()
  const r = resolve('inv', { fundChg: 'abc' })
  expect(r).toMatchObject({ value: invNet(0.05, 0.01), label: 'Set by LifeMap' })
  expect(r.by).not.toContain('NaN')
  expect(choose({}, 'lumpSum', 0.25 + 1e-12).lumpSum).toBeCloseTo(0.25)
})
