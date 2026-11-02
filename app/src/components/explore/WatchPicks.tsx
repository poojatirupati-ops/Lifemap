import type { CSSProperties } from 'react'
import { LIVE_SESSIONS } from './explore.data.ts'
import { openVideo, openVideos } from '../../state/explore.ts'
import LiveCard from './LiveCard.tsx'
import Strip from './Strip.tsx'
import VideoCard from './VideoCard.tsx'
import { videoLength, type Video } from './videos.data.ts'

const EYEBROW: CSSProperties = {
  margin: '0 0 4px',
  fontWeight: 800,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  fontSize: 11,
}

interface Props {
  videos: Video[]
  /** The goal that needs a nudge, when the featured video is picked for it. */
  nudgeGoal?: string
}

/** Watch · picked for you: one big video, four more in a strip and the next live session. */
export default function WatchPicks({ videos: [featured, ...more], nudgeGoal }: Props) {
  const style = {
    width: '100%',
    minHeight: 180,
    '--vart': `var(--art-${featured.art})`,
  } as CSSProperties
  return (
    <>
      <div className="sec">
        <h3>Watch · picked for you</h3>
        <button className="link" data-a="videos" onClick={openVideos}>
          All videos
        </button>
      </div>
      <button
        className="vthumb vph"
        style={style}
        data-a="video"
        data-p={featured.id}
        onClick={() => openVideo(featured.id)}
      >
        <span className="play" aria-hidden="true">
          ▶
        </span>
        <span className="len">{videoLength(featured)}</span>
        <small style={EYEBROW}>
          {nudgeGoal ? `Because ${nudgeGoal.toLowerCase()} needs a nudge` : 'A good place to start'}
        </small>
        <b style={{ fontSize: 18 }}>{featured.title}</b>
        <small>{featured.who}</small>
      </button>
      <Strip style={{ marginTop: 10 }}>
        {more.slice(0, 4).map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </Strip>
      <LiveCard session={LIVE_SESSIONS[0]} style={{ marginTop: 10 }} />
    </>
  )
}
