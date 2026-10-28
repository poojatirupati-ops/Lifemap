// Open the plan report (journey-spec §28): build its pages from the plan, or ask for what is missing.
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { useStore } from '../state/store.ts'
import { toast } from '../state/shell.ts'
import { localToday } from '../lib/today.ts'
import { selectorFor } from '../hooks/useSheetFocus.ts'
import { setReportOpener } from '../hooks/useGlobalKeys.ts'
import type { Plan } from '../state/types.ts'
import { LifeMapReport } from './lifeMapReport.js'
import { reportData, type ReportData } from './model/reportData.ts'
import { planMissing } from './model/readiness.ts'
import ReportDialog from './ReportDialog.tsx'
import { fitReport } from './fitReport.ts'

export interface BuiltReport {
  data: ReportData
  css: string
  pages: string[]
  photoSrc: (name: string) => string
}

// the report's photos are the app's own art, read from its CSS custom properties
const PHOTO_VARIABLES: Record<string, string> = {
  'house-for-sale': '--art-mortgage',
  'retired-reading': '--art-pension',
  'team-with-charts': '--art-investing',
  'money-plant': '--art-savings',
  'car-and-calculator': '--art-everyday',
  'magnifier-map': '--cover-photo',
}
const photos = new Map<string, string>()

function photoSrc(name: string) {
  if (!photos.has(name)) {
    const variable = PHOTO_VARIABLES[name]
    const value = variable
      ? getComputedStyle(document.documentElement).getPropertyValue(variable)
      : ''
    photos.set(name, value.match(/url\(\s*["']?([^"')]+)["']?\s*\)/)?.[1] ?? `media/${name}.jpg`)
  }
  return photos.get(name)!
}

/** The report's data and pages, or null while the plan is missing answers it needs. */
export function buildReport(plan: Plan): BuiltReport | null {
  // tools/view-equal.mjs pins the browser's today with window.__TODAY
  const data = reportData(plan, localToday((globalThis as { __TODAY?: string }).__TODAY))
  if (data.ready === false) return null
  const { css, pages } = LifeMapReport.reportPages(data, { photoSrc })
  return { data, css, pages, photoSrc }
}

// the dialog's own React root; made again if the app re-renders #report (e.g. hot reload)
let root: { element: HTMLElement; root: Root } | null = null
let opened = 0

export function openReport() {
  const { plan, openSheet, update } = useStore.getState()
  if (planMissing(plan).length) return openSheet('gate|report')
  let report: BuiltReport | null = null
  try {
    report = buildReport(plan)
  } catch {
    // a plan the engine cannot finish: ask for more, as when answers are missing
  }
  if (!report) {
    openSheet('gate|report')
    toast('We need a little more to build your report.')
    return
  }

  let style = document.getElementById('lmr-css')
  if (!style) {
    style = document.createElement('style')
    style.id = 'lmr-css'
    document.head.appendChild(style)
  }
  style.textContent = report.css

  const dialog = document.getElementById('report')!
  if (root?.element !== dialog) root = { element: dialog, root: createRoot(dialog) }
  const { root: dialogRoot } = root
  flushSync(() => dialogRoot.render(<ReportDialog key={++opened} report={report} />))
  setReportOpener(selectorFor(document.activeElement))
  dialog.classList.add('on')
  for (const behind of document.querySelectorAll<HTMLElement>('.stage, .side')) behind.inert = true
  dialog.scrollTop = 0
  fitReport()
  dialog.querySelector<HTMLElement>('[data-r="print"]')!.focus()

  if (!plan.versions.some((version) => /report/.test(version.note)))
    update((draft) => {
      draft.versions.push({ note: 'Report downloaded', date: '29 Sep 2026' })
    })
}
