// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import * as Plan from '../../src/screens/Plan.screen.tsx'
import { stepSaving, suggestedSaving, whatIfTotal } from '../../src/components/plan/saving.ts'
import { dropIndex, shiftFor } from '../../src/hooks/useRankDrag.ts'
import sample from '../fixtures/sample-home.json'
import type { Snapshot } from '../../src/state/types.ts'

const plan = () => useStore.getState().plan

describe('saving maths', () => {
  test('a −/+ step rounds to €25 and never passes the spare money', () => {
    expect(stepSaving(310, 25, 1000)).toEqual({ amount: 325, capped: false })
    expect(stepSaving(10, -25, 1000)).toEqual({ amount: 0, capped: false })
    expect(stepSaving(990, 25, 1000)).toEqual({ amount: 1000, capped: true })
  })
  test('a bigger saving is suggested only with €50 more to spare', () => {
    expect(suggestedSaving(300, 300, 800)).toBe(400)
    expect(suggestedSaving(300, 375, 800)).toBeNull()
  })
  test('the live total warns when the what-if is more than is spare', () => {
    expect(whatIfTotal(300, 400, 150)).toEqual({ total: 450, spare: 400, over: true })
    expect(whatIfTotal(300, 400, 0).over).toBe(false)
  })
  test('a dragged row lands on whole rows and the rows between make room', () => {
    expect(dropIndex(0, 130, 60, 4)).toBe(2)
    expect(dropIndex(1, -500, 60, 4)).toBe(0)
    expect(shiftFor(1, 0, 2, 60)).toBe(-60)
    expect(shiftFor(3, 0, 2, 60)).toBe(0)
    expect(shiftFor(1, 3, 1, 60)).toBe(60)
  })
})

describe('My Plan', () => {
  beforeEach(() => {
    useStore.getState().load({ ...(sample as unknown as Snapshot), tab: 'plan' })
    window.matchMedia = () => ({ matches: false }) as MediaQueryList
    Element.prototype.scrollIntoView = () => {}
    render(<Plan.Body />)
  })

  test('shows the results in order', () => {
    const ids = ['tl-strip', 'r-res', 'r-goals', 'r-found', 'r-fnd', 'r-wi', 'r-glancec']
    const found = ids.map((id) => document.getElementById(id))
    expect(found.every(Boolean)).toBe(true)
    expect(screen.getByText(/goals on track/)).toBeTruthy()
  })

  test('the what-if extra starts on the least covered goal and can be saved', () => {
    expect(plan().wi.m).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: '25 euro more' }))
    expect(plan().wi.m).toBe(25)
    expect(plan().wi.g).not.toBeNull()
    expect(document.getElementById('wi-live')!.textContent).toMatch(/With this what-if/)
    fireEvent.click(screen.getByText('Save this plan'))
    expect(plan().pref).toEqual(plan().wi)
    fireEvent.click(screen.getByText('Back to my plan'))
    expect(plan().wi.m).toBe(0)
  })

  test('the saving steps by €25 and "Use my answer" resets it', () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save 25 euro less a month' }))
    expect(plan().saveM).not.toBeNull()
    fireEvent.click(screen.getByText('Use my answer'))
    expect(plan().saveM).toBeNull()
  })

  test('dragging a goal down in Which goal first? reorders the ranking', () => {
    vi.useFakeTimers()
    const rows = [...document.querySelectorAll<HTMLElement>('#rank-plan .rk-r')]
    const ids = rows.map((row) => Number(row.dataset.gid))
    rows.forEach((row, index) => {
      row.getBoundingClientRect = () => ({ top: index * 60, height: 56 }) as DOMRect
    })
    fireEvent.pointerDown(rows[0], { clientY: 10, button: 0, pointerId: 1 })
    expect(rows[0].className).toContain('drag')
    fireEvent.pointerMove(rows[0], { clientY: 75, pointerId: 1 })
    act(() => void vi.runAllTimers())
    fireEvent.pointerUp(rows[0], { pointerId: 1 })
    act(() => void vi.runAllTimers())
    vi.useRealTimers()
    expect(plan().rank).toEqual([ids[1], ids[0], ...ids.slice(2)])
    expect(document.getElementById('rank-msg-plan')!.textContent).toMatch(/is now 2 of/)
  })
})
