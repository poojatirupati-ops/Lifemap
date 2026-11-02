import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '../../state/store.ts'
import Brand from '../../components/frame/Brand.tsx'
import OrbitWheel from '../../components/welcome/OrbitWheel.tsx'
import Screen from '../../shell/Screen.tsx'

export const Route = createFileRoute('/_auth/')({ component: Welcome })

function Welcome() {
  const { openSheet } = useStore.getState()
  const navigate = useNavigate()

  return (
    <Screen
      id="D0"
      note="Cover (layout v21, 11 Oct 2026): calm, round. Brand, the map photo in a circle with five different real photos slowly orbiting (no labels, no repeats), headline, one line, one button."
      quiz
    >
      <div className="cover2 c3">
        <div className="qtop" style={{ minHeight: 40 }} />
        <div className="qbody c2body">
          <Brand />
          <OrbitWheel />
          <h2 tabIndex={-1}>The life you'd like, mapped out.</h2>
          <p className="cover-line">A life map that guides you, step by step.</p>
          <button className="wbtn" onClick={() => void navigate({ to: '/why' })}>
            Let's start
          </button>
          <p className="cover-under c3links">
            <button className="link" onClick={() => openSheet('invite')}>
              I have an invite
            </button>
            <span aria-hidden="true">·</span>
            <button className="link" onClick={() => openSheet('whyask')}>
              Why we ask
            </button>
          </p>
        </div>
      </div>
    </Screen>
  )
}
