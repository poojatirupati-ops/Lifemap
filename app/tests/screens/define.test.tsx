// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import goalsSet from '../fixtures/goals-set.json'
import { useStore } from '../../src/state/store.ts'
import type { Snapshot } from '../../src/state/types.ts'
import { path, renderAt, settle } from '../renderAt.tsx'

const plan = () => useStore.getState().plan

beforeEach(() => useStore.getState().load(structuredClone(goalsSet) as unknown as Snapshot))

test('About you: Next needs an age, a partner answer and dependants', async () => {
  useStore.getState().update((draft) => {
    draft.about = { age: null, partner: null, dependants: null }
  })
  await renderAt('/build/about')
  const next = screen.getByText('Next: your goals') as HTMLButtonElement
  expect(next.disabled).toBe(true)

  fireEvent.input(screen.getByLabelText('Year of birth'), { target: { value: '19x88' } })
  fireEvent.input(screen.getByLabelText('Month of birth'), { target: { value: '05' } })
  fireEvent.input(screen.getByLabelText('Day of birth'), { target: { value: '04' } })
  fireEvent.click(screen.getByText('Just me'))
  fireEvent.click(screen.getByLabelText('two'))
  expect(plan().about).toMatchObject({
    dob: { day: '04', month: '05', year: '1988' },
    partner: false,
  })
  expect(plan().about.age).toBeGreaterThanOrEqual(18)
  expect(next.disabled).toBe(false)
})

test('Goal picker toggles a goal and opens Something else as a sheet', async () => {
  await renderAt('/build/goals')
  fireEvent.click(screen.getByText('Wedding'))
  expect(plan().goals.at(-1)).toMatchObject({ key: 'wedding', id: 6 })
  fireEvent.click(screen.getByText('Wedding'))
  expect(plan().goals.some((goal) => goal.key === 'wedding')).toBe(false)
  fireEvent.click(screen.getByText('Something else'))
  expect(useStore.getState().sheet).toBe('other')
})

test('Your LifeMap reorders goals with the arrows and says where one went', async () => {
  await renderAt('/build/review')
  const names = () => [...document.querySelectorAll('.rk-t')].map((name) => name.textContent)
  const first = names()
  fireEvent.click(screen.getByLabelText(`Move ${first[1]} up, now 2 of 5`))
  expect(names().slice(0, 2)).toEqual([first[1], first[0]])
  // dnd-kit adds its own live region, so pick ours by id
  expect(document.getElementById('rank-msg-f4')?.textContent).toBe(`${first[1]} is now 1 of 5`)
  fireEvent.click(screen.getByText('Back to our suggested order'))
  expect(names()).toEqual(first)
})

test('Money profile: finishing suggests a horizon once others are answered, then goes on to P2', async () => {
  await renderAt('/build/profile')
  fireEvent.click(document.querySelector('[data-p="u10|2"]')!)
  fireEvent.click(screen.getByText('Save and continue'))
  await settle()
  expect(plan().moneyProfile.answers).toMatchObject({ u10: 2, u9: expect.any(Number) })
  expect(path()).toBe('/build/finances')
})
