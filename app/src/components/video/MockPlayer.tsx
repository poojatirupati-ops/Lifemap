import type { CSSProperties } from 'react'
import { useStore } from '../../state/store.ts'
import type { Video } from '../explore/videos.data.ts'

/** Kinds with a picture of their own; the rest use the video's art. */
const KIND_ART = ['pension', 'mortgage', 'protection']

const togglePlay = () => useStore.getState().update((plan) => void (plan.play = !plan.play))

/** A stand-in player for videos not filmed yet: play shows the opening caption. */
export default function MockPlayer({ video }: { video: Video }) {
  const playing = useStore((store) => store.plan.play)
  const art = KIND_ART.includes(video.kind) ? video.kind : video.art

  return (
    <div
      className={playing ? 'player vp2 on' : 'player vp2'}
      style={{ '--vart': `var(--art-${art})` } as CSSProperties}
    >
      <button
        className="play"
        data-a="vplay"
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={togglePlay}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      {playing ? <div className="cc">{video.caption}</div> : null}
      <div className="ctl" aria-hidden="true">
        <span>{playing ? '0:14' : '0:00'}</span>
        <span className="tr">
          <i></i>
        </span>
        <span>{video.mins}:00</span>
        <span>CC</span>
        <span>1×</span>
      </div>
    </div>
  )
}
