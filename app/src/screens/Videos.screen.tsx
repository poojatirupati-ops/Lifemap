import clsx from 'clsx'
import type { CSSProperties } from 'react'
import AppHead from '../components/frame/AppHead.tsx'
import { unseenLooks } from '../components/home/useHome.ts'
import { exploreBack, openVideo, remindMe, showVideoKind } from '../state/explore.ts'
import VideoCard from '../components/explore/VideoCard.tsx'
import {
  VIDEO_KIND_LABEL,
  useLiveSessions,
  useVideos,
  videoLength,
  type VideoKind,
} from '../content/cms.tsx'
import { useStore } from '../state/store.ts'

export const key = 'VIDS'
export const id = 'VID-00'
export const note =
  'Video library (Lifecast): short explainers filtered by topic, plus live expert sessions. Every video links to a tool and an expert.'

const FILTERS = [['all', 'All'], ...Object.entries(VIDEO_KIND_LABEL)] as [
  VideoKind | 'all',
  string,
][]

export function Head() {
  // Head is called by ScreenHost, not rendered, so it must not use hooks; ScreenHost re-renders on plan changes.
  const needsLook = unseenLooks(useStore.getState().plan)
  return AppHead({
    title: 'Watch',
    sub: 'Short videos and live sessions with experts.',
    back: exploreBack,
    needsLook,
  })
}

export function Body() {
  const shown = useStore((store) => store.videoFilter)
  const sessions = useLiveSessions()
  const [featured, ...more] = useVideos().filter((video) => shown === 'all' || video.kind === shown)

  return (
    <>
      <div className="chips wchips" role="group" aria-label="Filter videos">
        {FILTERS.map(([kind, label]) => (
          <button
            key={kind}
            className={clsx('chip sm', { sel: kind === shown })}
            aria-pressed={kind === shown}
            data-a="vfilter"
            data-p={kind}
            onClick={() => showVideoKind(kind)}
          >
            {label}
          </button>
        ))}
      </div>
      {featured ? (
        <button
          className="vfeat"
          data-a="video"
          data-p={featured.id}
          style={{ '--vart': `var(--art-${featured.art})` } as CSSProperties}
          onClick={() => openVideo(featured.id)}
        >
          <span className="vf-tag">Featured · {videoLength(featured)}</span>
          <span className="vf-play" aria-hidden="true">
            ▶
          </span>
          <span className="vf-b">
            <small>{VIDEO_KIND_LABEL[featured.kind]}</small>
            <b>{featured.title}</b>
            <span>{featured.role}</span>
          </span>
        </button>
      ) : null}
      {more.length > 0 ? (
        <>
          <div className="sec">
            <h3>More to watch</h3>
            <span className="small">{more.length} videos</span>
          </div>
          <div className="vlist">
            {more.map((video) => (
              <VideoCard key={video.id} video={video} grid />
            ))}
          </div>
        </>
      ) : null}
      <div className="sec">
        <h3>Live with experts</h3>
      </div>
      {/* TODO(R-27): use LiveCard once R-27 gives it a `who` (subtitle) prop. */}
      {sessions.map(({ when, title }) => {
        const [day, ...time] = when.split(' ')
        return (
          <div key={title} className="card lv3" style={{ marginBottom: 8 }}>
            <span className="lv2-d" aria-hidden="true">
              <small>{day}</small>
              <b>{time.join(' ')}</b>
            </span>
            <span className="lv3-m">
              <b>{title}</b>
              <small>
                <i className="lv3-dot" aria-hidden="true"></i>Live · free · Ask questions in the
                chat
              </small>
            </span>
            <button
              className="mp-seat"
              data-a="remind"
              aria-label={`Remind me: ${title}`}
              onClick={remindMe}
            >
              <span aria-hidden="true">🔔</span> Remind me
            </button>
          </div>
        )
      })}
    </>
  )
}
