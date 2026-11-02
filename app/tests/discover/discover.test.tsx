// @vitest-environment jsdom
// The Discover answer flow: one tap answers and advances, the reveal needs four answers and finishes onboarding.
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ScreenHost from '../../src/shell/ScreenHost.tsx'
import { startFrom, useShell } from '../../src/state/shell.ts'
import { useStore } from '../../src/state/store.ts'
import { fresh } from '../../src/state/fresh.ts'

const state = () => useStore.getState()
const tap = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))

beforeEach(() => {
  vi.useFakeTimers()
  useShell.setState({ authed: true })
  startFrom({ ...fresh(), screen: 'D2', discoverStep: 0 })
})
afterEach(() => vi.useRealTimers())

describe('Discover', () => {
  it('answers six questions with one tap each, then reveals the personality', () => {
    render(<ScreenHost />)
    for (let i = 0; i < 6; i++) {
      expect(screen.getByText(`${i + 1} of 6`)).toBeTruthy()
      const answer = screen.getAllByRole('button', { pressed: false })[0]
      fireEvent.click(answer)
      expect(answer.getAttribute('aria-pressed')).toBe('true')
      act(() => vi.advanceTimersByTime(450))
    }
    expect(state().screen).toBe('DR')
    expect(screen.getByRole('heading', { name: 'Achiever' })).toBeTruthy()
    tap('Continue')
    expect([state().plan.onboarded, state().inShell, state().tab]).toEqual([true, true, 'home'])
  })

  it('Back and Skip move between questions', () => {
    render(<ScreenHost />)
    tap('Skip')
    expect([state().screen, state().plan.discoverStep]).toEqual(['D3', 1])
    tap('← Back')
    tap('← Back')
    expect(state().screen).toBe('D1')
  })

  it('asks for more answers before four, and the dots jump to a question', () => {
    startFrom({ ...fresh(), screen: 'DR', answers: { 2: 0, 4: 1 } })
    render(<ScreenHost />)
    expect(screen.getByRole('heading', { name: 'Just 2 more to go' })).toBeTruthy()
    tap('Answer a few more')
    expect([state().screen, state().plan.discoverStep]).toEqual(['D4', 2])
  })
})
