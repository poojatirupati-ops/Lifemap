// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import discovered from '../fixtures/discovered.json'
import { toolsForYou } from '../../src/domain/explore/picks.ts'
import { profilePills, profileRead } from '../../src/domain/discovery/profileCard.ts'
import { dateLine, greeting } from '../../src/lib/greeting.ts'
import { useStore } from '../../src/state/store.ts'
import type { Snapshot } from '../../src/state/types.ts'
import * as HomeStart from '../../src/screens/HomeStart.screen.tsx'
import * as PlanEmpty from '../../src/screens/PlanEmpty.screen.tsx'

const fixture: Snapshot = structuredClone(discovered)

beforeEach(() => {
  useStore.getState().load(structuredClone(fixture))
  useStore.getState().update((plan) => {
    plan.inShell = true
    plan.tab = 'home'
  })
})

test('tools for the goals come first, then the everyday ones, six at most', () => {
  expect(toolsForYou([])).toEqual(['goalplanner', 'emergency', 'surplus', 'lifecover', 'compound'])
  expect(toolsForYou(['mortgage'])).toEqual([
    'borrow',
    'deposit',
    'goalplanner',
    'emergency',
    'surplus',
    'lifecover',
  ])
})

test('greeting by hour and the date line', () => {
  expect([9, 14, 20].map(greeting)).toEqual(['Good morning', 'Good afternoon', 'Good evening'])
  expect(dateLine(new Date(2026, 9, 28))).toBe('Wednesday · 28 October')
})

test('profile pills light the meter by comfort and cushion', () => {
  const read = profileRead(useStore.getState().plan)
  expect(read).toMatchObject({ comfort: 'Balanced', cushion: 'Thin' })
  expect(profilePills(read).map((pill) => pill.level)).toEqual([3, 1])
  expect(profilePills({ comfort: null, cushion: null }).map((pill) => pill.level)).toEqual([0, 0])
})

test('Home before a plan: personality pill, calculator opens in Explore', () => {
  render(<HomeStart.Body />)
  expect(screen.getByText('Welcome to Life Map')).toBeTruthy()
  expect(screen.getByText('Achiever', { selector: '.h0pill b' })).toBeTruthy()
  expect(screen.getAllByText(/^◆/, { selector: '.tg' })).toHaveLength(3)

  fireEvent.click(screen.getByText('Goal planner').closest('button')!)
  expect(useStore.getState().plan).toMatchObject({
    tab: 'explore',
    xs: [{ v: 'CALC', p: 'goalplanner' }],
  })
})

test('the plan card shows where the builder is', () => {
  useStore.getState().update((plan) => void (plan.planBuilder = true))
  useStore.getState().go('F1')
  render(<HomeStart.Body />)
  expect(screen.getByText('Carry on with your plan')).toBeTruthy()
  expect(screen.getByText(/Step 2 of 8 · your goals/)).toBeTruthy()
})

test('Empty plan lists the 8 steps and Start my plan opens step 1', () => {
  render(<PlanEmpty.Body />)
  expect(screen.getByText('If needed').closest('b')?.textContent).toBe(
    '5. Secure your account If needed',
  )

  fireEvent.click(screen.getByText('Start my plan'))
  expect(useStore.getState()).toMatchObject({ screen: 'B1', plan: { tab: 'plan', pb: true } })
})
