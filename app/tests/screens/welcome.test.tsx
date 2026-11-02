// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { fresh } from '../../src/state/fresh.ts'
import { path, renderAt, settle } from '../renderAt.tsx'

beforeEach(() => useStore.getState().load(fresh()))

test('Welcome starts the journey and opens its sheets', async () => {
  await renderAt('/')
  fireEvent.click(screen.getByText('I have an invite'))
  expect(useStore.getState().sheet).toBe('invite')
  useStore.getState().closeSheet()
  fireEvent.click(await screen.findByText("Let's start"))
  await settle()
  expect(path()).toBe('/why')
})

test('What brought you here toggles reasons and starts the questions', async () => {
  await renderAt('/why')
  const continueButton = screen.getByRole('button', { name: 'Continue' })
  expect(continueButton).toHaveProperty('disabled', true)

  const home = screen.getByRole('button', { name: /Home & mortgage/ })
  fireEvent.click(home)
  fireEvent.click(screen.getByRole('button', { name: /Just exploring/ }))
  expect(useStore.getState().plan.why).toEqual(['home', 'curious'])
  expect(home.getAttribute('aria-pressed')).toBe('true')
  expect(home.className).toBe('chip wtile sel')

  fireEvent.click(home)
  expect(useStore.getState().plan.why).toEqual(['curious'])

  useStore.getState().update((plan) => {
    plan.discoverStep = 3
  })
  fireEvent.click(continueButton)
  await settle()
  expect(path()).toBe('/discover/1')
  expect(useStore.getState().plan.discoverStep).toBe(0)
})
