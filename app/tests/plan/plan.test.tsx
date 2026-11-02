// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { renderAt } from '../renderAt.tsx'
import { stepSaving, suggestedSaving, whatIfTotal } from '../../src/domain/planning/saving.ts'
import sample from '../fixtures/sample-home.json'
import type { Snapshot } from '../../src/state/types.ts'

// the report and its PDF engine are not part of My Plan's behaviour
vi.mock('../../src/report/openReport.ts', () => ({ openReport: () => {}, preloadReport: () => {} }))

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
})

describe('My Plan', () => {
  beforeEach(async () => {
    useStore.getState().load(sample as unknown as Snapshot)
    window.matchMedia = () => ({ matches: false }) as MediaQueryList
    Element.prototype.scrollIntoView = () => {}
    await renderAt('/plan')
  })

  test('shows the results in order', () => {
    const ids = ['tl-strip', 'r-res', 'r-goals', 'r-found', 'r-fnd', 'r-wi', 'r-glancec']
    const found = ids.map((id) => document.getElementById(id))
    expect(found.every(Boolean)).toBe(true)
    expect(screen.getAllByText(/goals on track/).length).toBeGreaterThan(0)
  })

  test('the what-if extra starts on the least covered goal and can be saved', () => {
    expect(plan().whatIf.monthlyExtra).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: '25 euro more' }))
    expect(plan().whatIf.monthlyExtra).toBe(25)
    expect(plan().whatIf.goalId).not.toBeNull()
    expect(document.getElementById('wi-live')!.textContent).toMatch(/With this what-if/)
    fireEvent.click(screen.getByText('Save this plan'))
    expect(plan().preferredWhatIf).toEqual(plan().whatIf)
    fireEvent.click(screen.getByText('Back to my plan'))
    expect(plan().whatIf.monthlyExtra).toBe(0)
  })

  test('the saving steps by €25 and "Use my answer" resets it', () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save 25 euro less a month' }))
    expect(plan().monthlySaving).not.toBeNull()
    fireEvent.click(screen.getByText('Use my answer'))
    expect(plan().monthlySaving).toBeNull()
  })

  test('the arrows in Which goal first? reorder the ranking', () => {
    const rows = [...document.querySelectorAll<HTMLElement>('#rank-plan .rk-r')]
    const ids = rows.map((row) => Number(row.dataset.gid))
    fireEvent.click(rows[0].querySelector('[data-p$="|down"]')!)
    expect(plan().rank).toEqual([ids[1], ids[0], ...ids.slice(2)])
    expect(document.getElementById('rank-msg-plan')!.textContent).toMatch(/is now 2 of/)
    fireEvent.click(document.querySelector('#rank-plan .rk-r [data-p$="|up"]')!)
    expect(plan().rank).toEqual([ids[1], ids[0], ...ids.slice(2)])
  })
})
