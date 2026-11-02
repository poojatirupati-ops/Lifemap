// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import type { Snapshot } from '../../src/state/types.ts'
import partial from '../fixtures/finances-partial.json'
import { path, renderAt, settle } from '../renderAt.tsx'
import ChoiceNumberBox from '../../src/components/finance/ChoiceNumberBox.tsx'

beforeEach(() => {
  useStore.getState().load(structuredClone(partial) as unknown as Snapshot)
  window.matchMedia ??= (() => ({ matches: true })) as never
})

test('Your finances lists the six sections and opens one', async () => {
  await renderAt('/build/finances')
  expect(
    screen.getAllByRole('button', { name: /^.*(Done|In progress|Not started|Needs a look)$/ }),
  ).toHaveLength(6)
  fireEvent.click(screen.getByText('Income and expenses'))
  await settle()
  expect([path(), useStore.getState().financeSection]).toEqual(['/build/finances/2', 1])
})

test('Check your details: choices gate the results, then Building opens the results', async () => {
  useStore.getState().update((plan) => {
    plan.retireSet = false
    plan.inflation = null
  })
  await renderAt('/build/check')
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
  await settle()
  expect(path()).toBe('/build/results')
  // reduced motion: the loader shows for 300ms
  await act(() => new Promise((done) => setTimeout(done, 400)))
  await settle()
  expect(path()).toBe('/plan')
  expect(useStore.getState()).toMatchObject({
    plan: { hasResults: true, checked: true },
    planScrollTo: 'results',
  })
})

test('Leave for my adviser marks a flagged figure', async () => {
  await renderAt('/build/check')
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
