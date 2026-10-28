import { beforeEach, expect, test } from 'vitest'
import { fresh } from '../../src/state/fresh'
import { useStore } from '../../src/state/store'
import type { ListItem } from '../../src/state/types'

const card = (owed: number): ListItem => ({
  id: 1,
  f: { owed },
  src: { owed: 'typed' },
  conf: {},
  man: {},
  fix: {},
  docFrom: null,
})

beforeEach(() => useStore.getState().load(fresh()))

test('go changes the screen and closes the sheet; openSheet and closeSheet toggle it', () => {
  const { go, openSheet, closeSheet } = useStore.getState()
  openSheet('profile')
  expect(useStore.getState().sheet).toBe('profile')
  go('B1')
  expect(useStore.getState()).toMatchObject({ screen: 'B1', sheet: null })
  openSheet('ask')
  closeSheet()
  expect(useStore.getState().sheet).toBeNull()
})

test('navigation leaves the plan untouched', () => {
  const before = useStore.getState().plan
  useStore.getState().go('F2')
  expect(useStore.getState().plan).toBe(before)
})

test('load splits screen and sheet off a snapshot, normalizes, and leaves the input alone', () => {
  const snapshot = { ...fresh(), scr: 'P2', sheet: 'ask', lists: { cards: [card(50)] } }
  useStore.getState().load(snapshot)
  const { plan, screen, sheet } = useStore.getState()
  expect({ screen, sheet }).toEqual({ screen: 'P2', sheet: 'ask' })
  expect(plan).not.toHaveProperty('scr')
  expect(plan.fin.cardBal).toBe(50)
  expect(snapshot.fin.cardBal).toBeUndefined()
})

test('update normalizes and returns a new plan', () => {
  const before = useStore.getState().plan
  useStore.getState().update((plan) => {
    plan.lists.cards = [card(50)]
  })
  expect(useStore.getState().plan.fin.cardBal).toBe(50)
  expect(before.fin.cardBal).toBeUndefined()
})
