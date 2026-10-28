import type { CSSProperties } from 'react'
import AppHead from '../components/frame/AppHead.tsx'
import { unseenLooks } from '../components/home/useHome.ts'
import { LIVE_SESSIONS } from '../components/explore/explore.data.ts'
import { exploreBack, openVideo, remindMe } from '../components/explore/exploreActions.ts'
import VideoCard from '../components/explore/VideoCard.tsx'
import { VIDEOS, VIDEO_KIND_LABEL } from '../components/explore/videos.data.ts'
import { useStore } from '../state/store.ts'

export const key = 'VIDS'
export const id = 'VID-00'
export const note =
  'Video library (Lifecast): short explainers filtered by topic, plus live expert sessions. Every video links to a tool and an expert.'

const FILTERS = [['all', 'All'], ...Object.entries(VIDEO_KIND_LABEL)]

const showKind = (kind: string) => useStore.getState().update((plan) => void (plan.vf = kind))

export const Head = () =>
  AppHead({
    title: 'Watch',
    sub: 'Short videos and live sessions with experts.',
    back: exploreBack,
    needsLook: unseenLooks(useStore.getState().plan),
  })

export function Body() {
  const shown = useStore((store) => store.plan.vf || 'all')
  const [featured, ...more] = VIDEOS.filter((video) => shown === 'all' || video.kind === shown)

  return (
    <>
      <div className="chips wchips" role="group" aria-label="Filter videos">
        {FILTERS.map(([kind, label]) => (
          <button
            key={kind}
            className={kind === shown ? 'chip sm sel' : 'chip sm'}
            aria-pressed={kind === shown}
            data-a="vfilter"
            data-p={kind}
            onClick={() => showKind(kind)}
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
          <span className="vf-tag">Featured · {featured.duration ?? `${featured.mins} min`}</span>
          <span className="vf-play" aria-hidden="true">
            ▶
          </span>
          <span className="vf-b">
            <small>{VIDEO_KIND_LABEL[featured.kind]}</small>
            <b>{featured.title}</b>
            <span>{featured.who.split(' · ')[1]}</span>
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
      {/* TODO(R-30): use LiveCard once it takes the "who" line as a prop. */}
      {LIVE_SESSIONS.map(({ when, title }) => {
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
