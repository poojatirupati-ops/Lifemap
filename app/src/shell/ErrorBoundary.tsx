import type { ReactNode } from 'react'
import { ErrorBoundary as Boundary, type FallbackProps } from 'react-error-boundary'
import { captureException } from '../analytics/analytics.ts'

function Fallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="note" role="alert">
      <p>Something went wrong on this screen. Your plan is safe.</p>
      <button className="btn sm" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  )
}

/** Per-screen boundary (shell/Screen.tsx remounts it with each screen). Reports through PostHog, which only runs with consent. */
export default function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Boundary FallbackComponent={Fallback} onError={captureException}>
      {children}
    </Boundary>
  )
}
