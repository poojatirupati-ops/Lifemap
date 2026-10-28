import type { ReactNode } from 'react'
import StatusBar from './StatusBar.tsx'
import { useFitPhone } from './useFitPhone.ts'

/** The prototype's shell DOM, so its media queries apply unchanged: full-bleed under 800px, framed phone above. */
export default function AppFrame({ children }: { children: ReactNode }) {
  useFitPhone()
  return (
    <main className="stage">
      <div id="wrap">
        <div className="phone" id="phone">
          <StatusBar />
          <div id="screen"><div className="app-scroll">{children}</div></div>
          <div id="toast" role="status" aria-live="polite"></div>
        </div>
      </div>
    </main>
  )
}
