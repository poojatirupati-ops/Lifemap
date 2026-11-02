import { createFileRoute } from '@tanstack/react-router'
import clsx from 'clsx'
import type { CSSProperties } from 'react'
import AppScreen from '../../../../../components/frame/AppScreen.tsx'
import { exploreBack, openVideo, showVideoKind } from '../../../../../state/explore.ts'
import LiveCard from '../../../../../components/explore/LiveCard.tsx'
import VideoCard from '../../../../../components/explore/VideoCard.tsx'
import {
  VIDEO_KIND_LABEL,
  useLiveSessions,
  useVideos,
  videoLength,
  type VideoKind,
} from '../../../../../content/cms.tsx'
import Sec from '../../../../../components/ui/Sec.tsx'
import { useStore } from '../../../../../state/store.ts'

const FILTERS = [['all', 'All'], ...Object.entries(VIDEO_KIND_LABEL)] as [
  VideoKind | 'all',
  string,
][]

export const Route = createFileRoute('/_auth/_app/explore/videos/')({ component: Videos })

function Videos() {
  const shown = useStore((store) => store.videoFilter)
  const sessions = useLiveSessions()
  const [featured, ...more] = useVideos().filter((video) => shown === 'all' || video.kind === shown)

  return (
    <AppScreen
      id="VID-00"
      note="Video library (Lifecast): short explainers filtered by topic, plus live expert sessions. Every video links to a tool and an expert."
      title="Watch"
      sub="Short videos and live sessions with experts."
      back={exploreBack}
      bell
    >
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
          <Sec title="More to watch">
            <span className="small">{more.length} videos</span>
          </Sec>
          <div className="vlist">
            {more.map((video) => (
              <VideoCard key={video.id} video={video} grid />
            ))}
          </div>
        </>
      ) : null}
      <Sec title="Live with experts" />
      {sessions.map((session) => (
        <LiveCard
          key={session.title}
          session={session}
          who="Ask questions in the chat"
          style={{ marginBottom: 8 }}
        />
      ))}
    </AppScreen>
  )
}
