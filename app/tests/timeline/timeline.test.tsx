// @vitest-environment jsdom
import { act, fireEvent, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { renderAt } from '../renderAt.tsx'
import goalsSet from '../fixtures/goals-set.json'
import type { Snapshot } from '../../src/state/types.ts'

const plan = () => useStore.getState().plan
const ageOf = (name: string) => plan().goals.find((goal) => goal.name === name)!.age

beforeEach(async () => {
  useStore.getState().load(goalsSet as unknown as Snapshot)
  window.matchMedia = () => ({ matches: false }) as MediaQueryList
  Element.prototype.scrollIntoView = () => {}
  // jsdom has no layout: give the track a width so a drag maps to years
  Element.prototype.getBoundingClientRect = () => ({ width: 520 }) as DOMRect
  await renderAt('/build/timeline')
})

test('dragging a chip snaps to whole years and shows the year bubble while it moves', () => {
  const travel = screen.getByRole('slider', { name: 'Travel' })
  fireEvent.pointerDown(travel, { clientX: 100, button: 0 })
  fireEvent.pointerMove(travel, { clientX: 103 })
  expect(ageOf('Travel')).toBe(40) // under 5px is still a tap
  fireEvent.pointerMove(travel, { clientX: 200 })
  expect(ageOf('Travel')).toBe(50) // 100px of 520px is 10 of the 52 years to 90
  expect(travel.className).toContain('drag')
  expect(document.querySelector('.tl-tip b')?.textContent).toBe(String(2026 + 50 - 38)) // the plan starts in 2026
  fireEvent.pointerUp(travel)
  expect(document.querySelector('.tl-tip')).toBeNull()
  expect(useStore.getState().highlightedGoal).toBeNull()
  expect(document.getElementById('when-2')!.textContent).toBe('in 12 yrs · age 50 · 2038')
})

test('a tap highlights the goal row instead of moving it', () => {
  const travel = screen.getByRole('slider', { name: 'Travel' })
  fireEvent.pointerDown(travel, { clientX: 100, button: 0 })
  fireEvent.pointerUp(travel)
  expect(useStore.getState().highlightedGoal).toBe(2)
  expect(document.getElementById('row-2')!.className).toBe('grow hl')
})

test('keys move a goal: arrows by a year, shift by five, Home and End to the limits', () => {
  const travel = screen.getByRole('slider', { name: 'Travel' })
  fireEvent.keyDown(travel, { key: 'ArrowRight' })
  fireEvent.keyDown(travel, { key: 'ArrowUp', shiftKey: true })
  expect(ageOf('Travel')).toBe(46)
  fireEvent.keyDown(travel, { key: 'Home' })
  expect(ageOf('Travel')).toBe(39)
  fireEvent.keyDown(travel, { key: 'End' })
  expect(ageOf('Travel')).toBe(95) // plan end with a partner
  expect(travel.getAttribute('aria-valuemax')).toBe('95')

  const retire = screen.getByRole('slider', { name: 'Retire comfortably' })
  fireEvent.keyDown(retire, { key: 'End' })
  expect(plan()).toMatchObject({ retireAge: 94, retireSet: true })
  expect(plan().figures.retireAge).toBe(94)
})

test('the goal rows edit amounts, details and remove goals', () => {
  const amount = document.querySelector<HTMLInputElement>('#row-2 input.in')!
  amount.value = '12,500'
  fireEvent.blur(amount)
  expect(plan().goals.find((goal) => goal.id === 2)!.amount).toBe(12500)

  fireEvent.click(document.querySelector('#row-2 .gr-more')!)
  fireEvent.click(screen.getAllByRole('button', { name: 'Fixed date' })[0])
  expect(plan().goals.find((goal) => goal.id === 2)!.flex).toBe('Fixed date')

  act(() => {
    fireEvent.click(screen.getByRole('button', { name: 'Remove Emergency fund' }))
  })
  expect(plan()).toMatchObject({ safetyOff: true, safetyWanted: false })
  expect(plan().goals.some((goal) => goal.key === 'safety')).toBe(false)
})
