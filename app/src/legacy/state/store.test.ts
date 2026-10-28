import { beforeEach, expect, test } from 'vitest'
import { getPlan, KEY, reload, setPlan } from './store.ts'

const mem = new Map<string, string>()
globalThis.localStorage = {
  getItem: k => mem.get(k) ?? null,
  setItem: (k, v) => void mem.set(k, v),
} as Storage

beforeEach(() => mem.clear())

test('set, reload, get', () => {
  setPlan({ retireAge: 60, goals: [{ id: 1, k: 'car', kind: 'spend', spec: 'planner', name: 'Car', e: '🚗', age: 35, amount: 9000, saved: 0, who: 'Me', prio: 'Must have', flex: 'Can move' }] })
  reload()
  expect(getPlan().retireAge).toBe(60)
  expect(getPlan().goals[0]?.name).toBe('Car')
})

test('corrupt storage falls back to defaults', () => {
  mem.set(KEY, '{not json')
  reload()
  expect(getPlan().retireAge).toBeNull()
})

test('valid JSON of the wrong shape keeps defaults', () => {
  for (const bad of ['"abc"', '[1]', 'null', '7']) {
    mem.set(KEY, bad)
    reload()
    expect(getPlan().retireAge).toBeNull()
  }
  mem.set(KEY, '{"goals":"x","retireAge":60,"junk":1}')
  reload()
  expect(getPlan().goals).toEqual([])
  expect(getPlan().retireAge).toBe(60)
  mem.set(KEY, '{"infl":"abc","rank":"zz","pref":5}')
  reload()
  expect([getPlan().infl, getPlan().rank, getPlan().pref]).toEqual([null, null, null])
})

test('iid, null-default fields and __proto__ survive reload safely', () => {
  setPlan({ iid: 7, infl: 0.02, rank: [2, 1] })
  reload()
  expect(getPlan().iid).toBe(7)
  expect(getPlan().infl).toBe(0.02)
  expect(getPlan().rank).toEqual([2, 1])
  mem.set(KEY, '{"__proto__":{"x":1},"iid":3}')
  reload()
  expect(getPlan().iid).toBe(3)
  expect(Object.getPrototypeOf(getPlan())).toBe(Object.prototype)
})

test('v1 key is migrated when v2 is absent; v2 wins when both exist', () => {
  mem.set('lifemap.plan.v1', '{"retireAge":60,"retireSet":true,"about":{"age":41}}')
  reload()
  expect(getPlan().retireAge).toBe(60)
  expect(getPlan().about.legacyAge).toBe(41)
  mem.set(KEY, '{"retireAge":65}')
  reload()
  expect(getPlan().retireAge).toBe(65)
})
