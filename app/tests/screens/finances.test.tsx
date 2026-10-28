// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import type { Snapshot } from '../../src/state/types.ts'
import partial from '../fixtures/finances-partial.json'
import * as Overview from '../../src/screens/FinanceOverview.screen.tsx'
import * as Check from '../../src/screens/FinanceCheck.screen.tsx'

beforeEach(() => {
  useStore.getState().load(structuredClone(partial) as unknown as Snapshot)
  window.matchMedia ??= (() => ({ matches: true })) as never
})

test('Your finances lists the six sections and opens one', () => {
  render(<Overview.Body />)
  expect(
    screen.getAllByRole('button', { name: /^.*(Done|In progress|Not started|Needs a look)$/ }),
  ).toHaveLength(6)
  fireEvent.click(screen.getByText('Income and expenses'))
  expect(useStore.getState()).toMatchObject({ screen: 'P3', plan: { fsec: 1 } })
})

test('Check your details: choices gate the results, then Building opens the results', () => {
  vi.useFakeTimers()
  useStore.getState().update((plan) => {
    plan.retireSet = false
    plan.infl = null
  })
  render(<Check.Foot />)
  const see = screen.getByText('See my results') as HTMLButtonElement
  expect(see.disabled).toBe(true)
  expect(screen.getByText(/^Choose your retirement age above/)).toBeTruthy()

  act(() =>
    useStore.getState().update((plan) => {
      plan.retireSet = true
      plan.infl = 0.02
      plan.asm.planEnd = 90
      plan.pRetSet = true
    }),
  )
  fireEvent.click(screen.getByText('See my results'))
  expect(useStore.getState().screen).toBe('U1')
  vi.runAllTimers()
  expect(useStore.getState().plan).toMatchObject({
    app: true,
    tab: 'plan',
    planGo: 'results',
    checked: true,
  })
  vi.useRealTimers()
})

test('Leave for my adviser marks a flagged figure', () => {
  render(<Check.Body />)
  const leave = screen.getAllByText('Leave for my adviser')[0]
  fireEvent.click(leave)
  expect(Object.values(useStore.getState().plan.ack)).toContain(true)
})
