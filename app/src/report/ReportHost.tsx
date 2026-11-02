import { lazy, Suspense } from 'react'
import { useShell } from '../state/shell.ts'

// The pages, their model and the PDF code load only when the report is first opened.
const ReportDialog = lazy(() => import('./ReportDialog.tsx'))

// the original keeps this empty node in the DOM; view-equal and the #report CSS expect it
const closedReport = (
  <div id="report" role="dialog" aria-modal="true" aria-label="Your LifeMap plan report"></div>
)

/** #report over the app: empty and hidden until the report is opened. */
export default function ReportHost() {
  const open = useShell((shell) => shell.reportOpen)
  if (!open) return closedReport
  return (
    <Suspense fallback={closedReport}>
      <ReportDialog />
    </Suspense>
  )
}
