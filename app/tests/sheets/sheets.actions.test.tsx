// @vitest-environment jsdom
// What the sheets' buttons do.
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SheetHost from '../../src/shell/SheetHost'
import { useShell } from '../../src/state/shell'
import { fresh } from '../../src/state/fresh'
import { useStore } from '../../src/state/store'
import samplePlan from '../../src/state/sample-plan.json'
import type { Plan } from '../../src/state/types'

const open = (sheet: string, plan: Partial<Plan> = {}) => {
  useStore.getState().load({ ...fresh(), ...plan, sheet })
  return render(<SheetHost />)
}
const state = () => useStore.getState()
const toast = () => useShell.getState().toastMessage

// reduced motion: the typing pause is 0ms
window.matchMedia = (() => ({ matches: true })) as unknown as typeof window.matchMedia
afterEach(() => vi.useRealTimers())

describe('simple sheets', () => {
  it('invite links the code and closes', () => {
    open('invite')
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByText('Continue'))
    expect(state().plan.entry).toBe('adviser invite ABC123')
    expect(state().sheet).toBeNull()
    expect(toast()).toBe('Invite linked')
  })

  it('save checks the email first', () => {
    open('save')
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: /email|save my/i }))
    expect(screen.getByRole('alert').textContent).toBe('Please enter a valid email.')
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.ie' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /email|save my/i }))
    expect(state().plan.save).toEqual({ email: 'a@b.ie', comms: true, done: true, asked: true })
    expect(state().plan.acct.email).toBe('a@b.ie')
    expect(state().sheet).toBeNull()
  })

  it('something else adds an idea or a named goal', () => {
    open('other', { about: { age: 30, partner: false, deps: 0, married: null } })
    fireEvent.click(screen.getByText('📚 Fund a course'))
    expect(state().plan.goals.at(-1)).toMatchObject({
      k: 'other',
      name: 'Fund a course',
      amount: 8000,
    })
    expect(toast()).toBe('Fund a course added')
    act(() => state().openSheet('other'))
    fireEvent.click(screen.getByText('Add my goal'))
    expect(toast()).toBe('Type a name for your goal')
    fireEvent.change(screen.getByLabelText('Name it yourself'), { target: { value: 'Kitchen' } })
    fireEvent.click(screen.getByText('Add my goal'))
    expect(state().plan.goals.at(-1)).toMatchObject({ name: 'Kitchen', e: '⭐', amount: 10000 })
  })

  it('talking to an expert opens the Experts tab with that kind picked', () => {
    open('xpert|pension', { app: true })
    fireEvent.click(screen.getByText('Book a video call'))
    expect(state().plan).toMatchObject({
      tab: 'exp',
      exp: 'home',
      book: { spec: 'pension', mode: 'Video' },
    })
    expect(state().sheet).toBeNull()
    expect(toast()).toBe('Pick a time for your video call')
  })
})

describe('Ask LifeMap', () => {
  it('answers a suggested question after a short pause, then offers the rest', () => {
    vi.useFakeTimers()
    open('ask', samplePlan as unknown as Plan)
    const first = screen.getAllByRole('button').find((b) => b.className === 'cs')!
    const question = first.textContent!
    fireEvent.click(first)
    expect(screen.getByLabelText('LifeMap is typing')).toBeTruthy()
    act(() => vi.advanceTimersByTime(0)) // reduced motion in tests: no pause
    expect(screen.queryByLabelText('LifeMap is typing')).toBeNull()
    expect(screen.getByText('You could also ask')).toBeTruthy()
    expect(screen.queryAllByText(question)).toHaveLength(1) // asked, so no longer suggested
    fireEvent.click(screen.getByText('More questions'))
    expect(screen.queryByText('More questions')).toBeNull()
  })

  it('never gives advice, and asks for a question when empty', () => {
    vi.useFakeTimers()
    open('ask')
    fireEvent.click(screen.getByLabelText('Send'))
    expect(toast()).toBe('Type a question first')
    const input = screen.getByLabelText('Type your question') as HTMLInputElement
    input.value = 'Should I buy shares?'
    fireEvent.keyDown(input, { key: 'Enter' })
    act(() => vi.advanceTimersByTime(0))
    expect(screen.getByText(/that would be advice/)).toBeTruthy()
    expect(input.value).toBe('')
  })
})
