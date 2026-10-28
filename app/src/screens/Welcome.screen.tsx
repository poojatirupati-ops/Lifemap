import { useStore } from '../state/store.ts'
import Brand from '../components/frame/Brand.tsx'
import OrbitWheel from '../components/welcome/OrbitWheel.tsx'

export const key = 'D0'
export const id = 'D0'
export const note =
  'Cover (layout v21, 11 Oct 2026): calm, round. Brand, the map photo in a circle with five different real photos slowly orbiting (no labels, no repeats), headline, one line, one button.'
export const kind = 'quiz'

export function Body() {
  const go = useStore((store) => store.go)
  const openSheet = useStore((store) => store.openSheet)

  return (
    <div className="cover2 c3">
      <div className="qtop" style={{ minHeight: 40 }} />
      <div className="qbody c2body">
        <Brand />
        <OrbitWheel />
        <h2 tabIndex={-1}>The life you'd like, mapped out.</h2>
        <p className="cover-line">A life map that guides you, step by step.</p>
        <button className="wbtn" onClick={() => go('D1')}>
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
  )
}
