// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { fresh } from '../../src/state/fresh.ts'
import * as Welcome from '../../src/screens/Welcome.screen.tsx'
import * as WhyHere from '../../src/screens/WhyHere.screen.tsx'

beforeEach(() => useStore.getState().load(fresh()))

test('Welcome starts the journey and opens its sheets', () => {
  render(<Welcome.Body />)
  fireEvent.click(screen.getByText('I have an invite'))
  expect(useStore.getState().sheet).toBe('invite')
  fireEvent.click(screen.getByText("Let's start"))
  expect(useStore.getState()).toMatchObject({ screen: 'D1', sheet: null })
})

test('What brought you here toggles reasons and starts the questions', () => {
  render(<WhyHere.Body />)
  const continueButton = screen.getByText('Continue') as HTMLButtonElement
  expect(continueButton.disabled).toBe(true)

  const home = screen.getByText('Home & mortgage').closest('button')!
  fireEvent.click(home)
  fireEvent.click(screen.getByText('Just exploring'))
  expect(useStore.getState().plan.why).toEqual(['home', 'curious'])
  expect(home.getAttribute('aria-pressed')).toBe('true')
  expect(home.className).toBe('chip wtile sel')

  fireEvent.click(home)
  expect(useStore.getState().plan.why).toEqual(['curious'])

  useStore.getState().update((plan) => {
    plan.di = 3
  })
  fireEvent.click(continueButton)
  expect(useStore.getState().screen).toBe('D2')
  expect(useStore.getState().plan.di).toBe(0)
})
