import { lazy, Suspense, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { track } from '../analytics/analytics.ts'

// The pages, their model and the PDF code load only when the report is first opened.
const ReportDialog = lazy(() => import('./ReportDialog.tsx'))

// the original keeps this empty node in the DOM; view-equal and the #report CSS expect it
const closedReport = (
  <div id="report" role="dialog" aria-modal="true" aria-label="Your LifeMap plan report"></div>
)

/** #report over the app: empty and hidden until the report is opened. */
export default function ReportHost() {
  const open = useSearch({ strict: false, select: (search) => !!search.report })
  useEffect(() => {
    if (open) track('report_opened')
  }, [open])
  if (!open) return closedReport
  return (
    <Suspense fallback={closedReport}>
      <ReportDialog />
    </Suspense>
  )
}
