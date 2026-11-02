// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import type { Snapshot } from '../../src/state/types.ts'
import partial from '../fixtures/finances-partial.json'
import * as Overview from '../../src/screens/FinanceOverview.screen.tsx'
import * as Check from '../../src/screens/FinanceCheck.screen.tsx'
import ChoiceNumberBox from '../../src/components/finance/ChoiceNumberBox.tsx'

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
  expect(useStore.getState()).toMatchObject({ screen: 'P3', financeSection: 1 })
})

test('Check your details: choices gate the results, then Building opens the results', () => {
  vi.useFakeTimers()
  useStore.getState().update((plan) => {
    plan.retireSet = false
    plan.inflation = null
  })
  render(<Check.Foot />)
  const see = screen.getByText('See my results') as HTMLButtonElement
  expect(see.disabled).toBe(true)
  expect(screen.getByText(/^Choose your retirement age above/)).toBeTruthy()

  act(() =>
    useStore.getState().update((plan) => {
      plan.retireSet = true
      plan.inflation = 0.02
      plan.assumptions.planEnd = 90
      plan.partnerRetireSet = true
    }),
  )
  fireEvent.click(screen.getByText('See my results'))
  expect(useStore.getState().screen).toBe('U1')
  vi.runAllTimers()
  expect(useStore.getState()).toMatchObject({
    plan: { hasResults: true, checked: true },
    tab: 'plan',
    planScrollTo: 'results',
  })
  vi.useRealTimers()
})

test('Leave for my adviser marks a flagged figure', () => {
  render(<Check.Body />)
  const leave = screen.getAllByText('Leave for my adviser')[0]
  fireEvent.click(leave)
  expect(Object.values(useStore.getState().plan.acknowledged)).toContain(true)
})

test('A typed choice is kept within its limits and the hint says why', () => {
  const committed: number[] = []
  const hints: string[] = []
  render(
    <ChoiceNumberBox
      name="ret|a"
      value={65}
      unit="age"
      labelledBy="x"
      min={50}
      max={89}
      whole
      onCommit={(age) => committed.push(age)}
      onHint={(hint) => hints.push(hint)}
    />,
  )
  const box = document.querySelector<HTMLInputElement>('[data-nb="ret|a"]')!
  for (const typed of ['95', '40', '66.5', '70']) fireEvent.input(box, { target: { value: typed } })
  expect(committed).toEqual([89, 50, 67, 70])
  expect(hints).toEqual(['Max 89', 'Min 50', 'Whole numbers only', ''])
})
