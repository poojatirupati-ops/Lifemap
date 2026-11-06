import type { CSSProperties } from 'react'
import { openVideo, openVideos } from '../../state/explore.ts'
import LiveCard from './LiveCard.tsx'
import Strip from './Strip.tsx'
import VideoCard from './VideoCard.tsx'
import { videosForYou } from '../../domain/explore/picks.ts'
import { useLiveSessions, useVideos, videoLength } from '../../content/cms.tsx'
import Sec from '../ui/Sec.tsx'

const EYEBROW: CSSProperties = {
  margin: '0 0 4px',
  fontWeight: 800,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  fontSize: 11,
}

interface Props {
  /** The plan's goal kinds; videos about them come first. */
  specs: string[]
  /** The weakest goal's kind, whose videos come first of all. */
  nudgeSpec?: string
  /** The goal that needs a nudge, when the featured video is picked for it. */
  nudgeGoal?: string
}

/** Watch · picked for you: one big video, four more in a strip and the next live session. */
export default function WatchPicks({ specs, nudgeSpec, nudgeGoal }: Props) {
  const [featured, ...more] = videosForYou(useVideos(), specs, nudgeSpec)
  const [session] = useLiveSessions()
  if (!featured) return null
  const style = {
    width: '100%',
    minHeight: 180,
    '--vart': `var(--art-${featured.art})`,
  } as CSSProperties
  return (
    <>
      <Sec title="Watch · picked for you">
        <button className="link" data-a="videos" onClick={openVideos}>
          All videos
        </button>
      </Sec>
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
        <small>
          {featured.presenter} · {featured.role}
        </small>
      </button>
      <Strip style={{ marginTop: 10 }}>
        {more.slice(0, 4).map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </Strip>
      {session ? <LiveCard session={session} style={{ marginTop: 10 }} /> : null}
    </>
  )
}
