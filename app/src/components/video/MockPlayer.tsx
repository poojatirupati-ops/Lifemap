import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { togglePlay } from '../../state/explore.ts'
import { useStore } from '../../state/store.ts'
import type { Video } from '../../content/cms.tsx'

/** Kinds with a picture of their own; the rest use the video's art. */
const KIND_ART = ['pension', 'mortgage', 'protection']

/** A stand-in player for videos not filmed yet: play shows the opening caption. */
export default function MockPlayer({ video }: { video: Video }) {
  const playing = useStore((store) => store.playing)
  const art = KIND_ART.includes(video.kind) ? video.kind : video.art

  return (
    <div
      className={clsx('player vp2', { on: playing })}
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
