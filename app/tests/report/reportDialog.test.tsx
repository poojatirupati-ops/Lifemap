// @vitest-environment jsdom
// Opening the report: the gate when answers are missing, else the pages over the app; Close hands focus back.
import { act, fireEvent, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { openReport } from '../../src/report/openReport.ts'
import { renderAt } from '../renderAt.tsx'
import samplePlan from '../../src/state/sample-plan.json'
import fresh from '../fixtures/fresh.json'

const report = () => document.getElementById('report')!

// ReportHost loads the dialog lazily; load it once up front so waitFor only waits for React
beforeAll(() => import('../../src/report/ReportDialog.tsx'), 30_000)

const opener = () => document.querySelector<HTMLElement>('[data-a="report"]')!

describe('openReport', () => {
  it('asks for the missing answers instead', async () => {
    useStore.getState().load(fresh as never)
    await renderAt('/home')
    openReport()
    expect(useStore.getState().sheet).toBe('gate|report')
    expect(report().classList.contains('on')).toBe(false)
  })

  it('shows every page, hides the app from assistive tech and focuses Download', async () => {
    useStore.getState().load(samplePlan as never)
    useStore.getState().update((plan) => {
      plan.versions = []
    })
    await renderAt('/plan')
    opener().focus()
    act(() => openReport())
    // the dialog is a lazy chunk
    await waitFor(() => expect(report().classList.contains('on')).toBe(true))
    const slots = report().querySelectorAll('.lmr-slot .lmr-pg')
    expect(slots.length).toBeGreaterThan(10)
    expect(report().querySelector('.lmr-wrap')!.getAttribute('aria-label')).toBe(
      `Your plan report, ${slots.length} pages. Scroll to read.`,
    )
    expect(document.activeElement?.getAttribute('data-r')).toBe('print')
    // live regions (the toast, the plan's status lines) stay readable; everything else is hidden
    expect(document.querySelector('.tabs')!.getAttribute('aria-hidden')).toBe('true')
    // the report's stylesheet comes with it (vitest loads .css?raw as empty)
    expect(report().querySelector('style')).not.toBeNull()
    // the version keeps the tax rules the plan used, as the original's does
    expect(useStore.getState().plan.versions).toEqual([
      {
        note: 'Report downloaded',
        date: '29 Sep 2026',
        tax: expect.objectContaining({ startYear: 2026, override: null }),
      },
    ])

    fireEvent.click(report().querySelector('[data-r="close"]')!)
    // Radix hands focus back on a timer after the dialog unmounts
    await act(() => new Promise((done) => setTimeout(done, 0)))
    expect(report().classList.contains('on')).toBe(false)
    expect(document.querySelector('.tabs')!.hasAttribute('aria-hidden')).toBe(false)
    expect(document.activeElement).toBe(opener())
  })
})
