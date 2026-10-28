import { useEffect } from 'react'
import { useShell } from '../state/shell.ts'
import { useViewport } from '../hooks/useViewport.ts'
import { useWall } from '../auth/useWall.ts'
import Side from './Side.tsx'
import Phone from './Phone.tsx'

export default function App() {
  const desk = useShell((shell) => shell.desk)
  const viewport = useViewport(desk)
  useWall()
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
      <div id="report" role="dialog" aria-modal="true" aria-label="Your LifeMap plan report"></div>
    </>
  )
}
