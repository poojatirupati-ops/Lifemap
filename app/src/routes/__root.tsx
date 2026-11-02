import { useEffect } from 'react'
import { createRootRoute } from '@tanstack/react-router'
import { rerender, useShell } from '../state/shell.ts'
import { useViewport } from '../hooks/useViewport.ts'
import { useWall } from '../auth/useWall.ts'
import { useAnalytics } from '../analytics/analytics.ts'
import { useBranding, useTenantFigures } from '../shell/tenant.ts'
import Side from '../shell/Side.tsx'
import Phone from '../shell/Phone.tsx'
import ReportHost from '../report/ReportHost.tsx'

export const Route = createRootRoute({
  // ?report: the plan report open over any screen (report/openReport.ts)
  validateSearch: (search: Record<string, unknown>): { report?: true } =>
    search.report ? { report: true } : {},
  component: App,
})

function App() {
  const desk = useShell((shell) => shell.desk)
  const viewport = useViewport(desk)
  useWall()
  useAnalytics()
  useBranding()
  useTenantFigures(rerender)
  useEffect(() => {
    document.body.classList.toggle('desk', viewport.isDesk)
  }, [viewport.isDesk])
  return (
    <>
      <Side />
      <main className="stage">
        <div
          id="wrap"
          style={
            viewport.small
              ? { transform: 'none', width: '100%', height: '100%' }
              : { transform: `scale(${viewport.scale})` }
          }
        >
          <Phone style={viewport.small ? { width: '100%', height: '100%' } : undefined} />
        </div>
      </main>
      <ReportHost />
    </>
  )
}
