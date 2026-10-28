// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import discovered from '../fixtures/discovered.json'
import { useStore } from '../../src/state/store.ts'
import type { Snapshot } from '../../src/state/types.ts'
import * as HomeStart from '../../src/screens/HomeStart.screen.tsx'
import * as PlanEmpty from '../../src/screens/PlanEmpty.screen.tsx'

const toolIds = () =>
  [...document.querySelectorAll('.sv2')].map((tool) => tool.getAttribute('data-p'))

beforeEach(() => {
  useStore.getState().load(structuredClone(discovered) as unknown as Snapshot)
  useStore.getState().update((plan) => {
    plan.shell = true
    plan.tab = 'home'
  })
})

test('Home before a plan: personality, everyday tools, profile card and terms', () => {
  render(<HomeStart.Body />)
  expect(screen.getByText('Welcome to Life Map')).toBeTruthy()
  expect(document.querySelector('.h0pill b')?.textContent).toBe('Achiever')
  expect(toolIds()).toEqual(['goalplanner', 'emergency', 'surplus', 'lifecover', 'compound'])
  expect(document.querySelector('.sv2-i.gix')).toBeTruthy() // emergency gets its line icon
  const pills = [...document.querySelectorAll('.ec3-pt b')].map((pill) => pill.textContent)
  expect(pills).toEqual(['Balanced', 'Thin'])
  expect(document.querySelectorAll('.ec3-mt em.on')).toHaveLength(4)
  expect(document.querySelectorAll('.term')).toHaveLength(3)

  fireEvent.click(screen.getByText('Goal planner').closest('button')!)
  expect(useStore.getState().plan).toMatchObject({
    tab: 'explore',
    xs: [{ v: 'CALC', p: 'goalplanner' }],
  })
})

test('Home tools put the goals first and the plan card shows where the builder is', () => {
  useStore.getState().update((plan) => {
    plan.goals = [{ spec: 'mortgage' } as (typeof plan.goals)[number]]
    plan.pb = true
  })
  useStore.getState().go('F1')
  render(<HomeStart.Body />)
  expect(toolIds()).toEqual([
    'borrow',
    'deposit',
    'goalplanner',
    'emergency',
    'surplus',
    'lifecover',
  ])
  expect(screen.getByText('Carry on with your plan')).toBeTruthy()
  expect(document.querySelector('.h0due')?.textContent).toBe('🕒 Step 2 of 8 · your goals')
})

test('Empty plan lists the 8 steps and Start my plan opens step 1', () => {
  render(<PlanEmpty.Body />)
  const steps = [...document.querySelectorAll('.wsteps b')].map((step) => step.textContent)
  expect(steps).toHaveLength(8)
  expect(steps[4]).toBe('5. Secure your account If needed')

  fireEvent.click(screen.getByText('Start my plan'))
  expect(useStore.getState()).toMatchObject({ screen: 'B1', plan: { tab: 'plan', pb: true } })
})
