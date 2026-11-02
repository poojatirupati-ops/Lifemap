// @vitest-environment jsdom
// The Discover answer flow: one tap answers and advances, the reveal needs four answers and finishes onboarding.
import { act, fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { startFrom } from '../../src/state/shell.ts'
import { path, renderAt } from '../renderAt.tsx'
import { useStore } from '../../src/state/store.ts'
import { fresh } from '../../src/state/fresh.ts'

const state = () => useStore.getState()
const tap = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))

beforeEach(() => startFrom(fresh()))
/** The chosen answer shows for a moment (450ms) before the next question. */
const pause = () => act(() => new Promise((done) => setTimeout(done, 500)))

describe('Discover', () => {
  it('answers six questions with one tap each, then reveals the personality', async () => {
    await renderAt('/discover/1')
    for (let i = 0; i < 6; i++) {
      expect(screen.getByText(`${i + 1} of 6`)).toBeTruthy()
      const answer = screen.getAllByRole('button', { pressed: false })[0]
      fireEvent.click(answer)
      expect(answer.getAttribute('aria-pressed')).toBe('true')
      await pause()
    }
    expect(await screen.findByRole('heading', { name: 'Achiever' })).toBeTruthy()
    expect(path()).toBe('/personality')
    await act(async () => tap('Continue'))
    expect([state().plan.onboarded, path()]).toEqual([true, '/home'])
  })

  it('Back and Skip move between questions', async () => {
    await renderAt('/discover/1')
    await act(async () => tap('Skip'))
    expect([path(), state().plan.discoverStep]).toEqual(['/discover/2', 1])
    await act(async () => tap('← Back'))
    await act(async () => tap('← Back'))
    expect(path()).toBe('/why')
  })

  it('asks for more answers before four, and the dots jump to a question', async () => {
    startFrom({ ...fresh(), answers: { 2: 0, 4: 1 } })
    await renderAt('/personality')
    expect(screen.getByRole('heading', { name: 'Just 2 more to go' })).toBeTruthy()
    await act(async () => tap('Answer a few more'))
    expect([path(), state().plan.discoverStep]).toEqual(['/discover/3', 2])
  })
})
