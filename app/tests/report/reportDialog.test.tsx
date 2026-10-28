// @vitest-environment jsdom
// Opening the report: the gate when answers are missing, else the pages over the app; Close hands focus back.
import { fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { openReport } from '../../src/report/openReport.tsx'
import { closeReport } from '../../src/hooks/useGlobalKeys.ts'
import samplePlan from '../../src/state/sample-plan.json'
import fresh from '../fixtures/fresh.json'

// jsdom has no CSS.escape
globalThis.CSS ??= { escape: (text: string) => text } as never

const report = () => document.getElementById('report')!

beforeEach(() => {
  closeReport()
  document.body.innerHTML =
    '<main class="stage"><div id="screen"><button id="opener">Download</button></div></main>' +
    '<div id="report" role="dialog" aria-modal="true"></div>'
})

describe('openReport', () => {
  it('asks for the missing answers instead', () => {
    useStore.getState().load(fresh as never)
    openReport()
    expect(useStore.getState().sheet).toBe('gate|report')
    expect(report().classList.contains('on')).toBe(false)
  })

  it('shows every page, makes the app inert and focuses Download', () => {
    useStore.getState().load(samplePlan as never)
    useStore.getState().update((plan) => {
      plan.versions = []
    })
    document.getElementById('opener')!.focus()
    openReport()
    expect(report().classList.contains('on')).toBe(true)
    const slots = report().querySelectorAll('.lmr-slot .lmr-pg')
    expect(slots.length).toBeGreaterThan(10)
    expect(report().querySelector('.lmr-wrap')!.getAttribute('aria-label')).toBe(
      `Your plan report, ${slots.length} pages. Scroll to read.`,
    )
    expect(document.activeElement?.getAttribute('data-r')).toBe('print')
    expect(document.querySelector<HTMLElement>('.stage')!.inert).toBe(true)
    expect(document.getElementById('lmr-css')!.textContent).toContain('.lmr-pg')
    expect(useStore.getState().plan.versions).toEqual([
      { note: 'Report downloaded', date: '29 Sep 2026' },
    ])

    fireEvent.click(report().querySelector('[data-r="close"]')!)
    expect(report().classList.contains('on')).toBe(false)
    expect(document.querySelector<HTMLElement>('.stage')!.inert).toBe(false)
    expect(document.activeElement?.id).toBe('opener')
  })
})
