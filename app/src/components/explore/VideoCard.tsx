import type { CSSProperties } from 'react'
import { VIDEO_KIND_LABEL, type Video } from './videos.data.ts'
import { openVideo } from './exploreActions.ts'

/** A video card with the picture on top; `grid` for the video library's grid. */
export default function VideoCard({ video, grid }: { video: Video; grid?: boolean }) {
  const role = video.who.split(' · ')[1]
  return (
    <button
      className={grid ? 'vcard grid' : 'vcard'}
      data-a="video"
      data-p={video.id}
      onClick={() => openVideo(video.id)}
    >
      <span className="vc-img" style={{ '--vart': `var(--art-${video.art})` } as CSSProperties}>
        <span className="len">{video.duration ?? `${video.mins} min`}</span>
        <span className="play" aria-hidden="true">
          ▶
        </span>
      </span>
      <span className="vc-body">
        <span className="vc-kind">{VIDEO_KIND_LABEL[video.kind]}</span>
        <b>{video.title}</b>
        <small>{role}</small>
      </span>
    </button>
  )
}
