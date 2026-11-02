import { beforeEach, expect, test } from 'vitest'
import { fresh } from '../../src/state/fresh'
import { useStore } from '../../src/state/store'
import type { ListItem } from '../../src/state/types'

const card = (owed: number): ListItem => ({
  id: 1,
  fields: { owed },
  sources: { owed: 'typed' },
  confidence: {},
  manual: {},
  fixed: {},
  docFrom: null,
})

beforeEach(() => useStore.getState().load(fresh()))

test('openSheet and closeSheet toggle the sheet', () => {
  const { openSheet, closeSheet } = useStore.getState()
  openSheet('profile')
  expect(useStore.getState().sheet).toBe('profile')
  closeSheet()
  expect(useStore.getState().sheet).toBeNull()
})

test('load splits the sheet off a snapshot, drops old screen state, normalizes, and leaves the input alone', () => {
  const snapshot = { ...fresh(), scr: 'P2', sheet: 'ask', lists: { cards: [card(50)] } }
  useStore.getState().load(snapshot)
  const { plan, sheet } = useStore.getState()
  expect(sheet).toBe('ask')
  expect(plan).not.toHaveProperty('scr')
  expect(plan).not.toHaveProperty('screen')
  expect(plan.figures.cardBal).toBe(50)
  expect(snapshot.figures.cardBal).toBeUndefined()
})

test('update normalizes and returns a new plan', () => {
  const before = useStore.getState().plan
  useStore.getState().update((plan) => {
    plan.lists.cards = [card(50)]
  })
  expect(useStore.getState().plan.figures.cardBal).toBe(50)
  expect(before.figures.cardBal).toBeUndefined()
})
