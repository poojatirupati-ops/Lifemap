// @vitest-environment jsdom
// The Discover answer flow: one tap answers and advances, the reveal needs four answers, save and skip.
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
  startFrom({ ...fresh(), scr: 'D2', di: 0 })
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
    expect(state().screen).toBe('DS')
  })

  it('Back and Skip move between questions', () => {
    render(<ScreenHost />)
    tap('Skip')
    expect([state().screen, state().plan.di]).toEqual(['D3', 1])
    tap('← Back')
    tap('← Back')
    expect(state().screen).toBe('D1')
  })

  it('asks for more answers before four, and the dots jump to a question', () => {
    startFrom({ ...fresh(), scr: 'DR', ans: { 2: 0, 4: 1 } })
    render(<ScreenHost />)
    expect(screen.getByRole('heading', { name: 'Just 2 more to go' })).toBeTruthy()
    tap('Answer a few more')
    expect([state().screen, state().plan.di]).toEqual(['D4', 2])
  })

  it('Save checks the email, then saves and enters the app', () => {
    useShell.setState({ authed: true })
    startFrom({ ...fresh(), scr: 'DS', ans: { 2: 0, 4: 1, 7: 1, 8: 2 } })
    render(<ScreenHost />)
    expect(screen.getByText(/Achiever · your 6 answers/)).toBeTruthy()
    const email = screen.getByLabelText('Email') as HTMLInputElement
    fireEvent.input(email, { target: { value: 'nope' } })
    tap('Save my results')
    expect(screen.getByRole('alert').textContent).toMatch(/valid email/)
    fireEvent.input(email, { target: { value: ' me@example.com ' } })
    tap('Save my results')
    expect(state().plan.save).toMatchObject({ email: 'me@example.com', done: true, asked: true })
    expect([state().plan.shell, state().plan.tab]).toEqual([true, 'home'])
  })

  it('Skip for now on save enters the app, which sends a signed-out visitor to sign-in', () => {
    useShell.setState({ authed: false })
    startFrom({ ...fresh(), scr: 'DS' })
    render(<ScreenHost />)
    tap('Skip for now')
    expect(state().plan.save.asked).toBe(true)
    expect(state().screen).toBe('P1')
  })
})
