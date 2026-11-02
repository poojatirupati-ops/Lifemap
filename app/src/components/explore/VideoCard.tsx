import type { CSSProperties } from 'react'
import { VIDEO_KIND_LABEL, videoLength, type Video } from '../../content/cms.tsx'
import { openVideo } from '../../state/explore.ts'

/** A video card with the picture on top; `grid` for the video library's grid. */
export default function VideoCard({ video, grid }: { video: Video; grid?: boolean }) {
  return (
    <button
      className={grid ? 'vcard grid' : 'vcard'}
      data-a="video"
      data-p={video.id}
      onClick={() => openVideo(video.id)}
    >
      <span className="vc-img" style={{ '--vart': `var(--art-${video.art})` } as CSSProperties}>
        <span className="len">{videoLength(video)}</span>
        <span className="play" aria-hidden="true">
          ▶
        </span>
      </span>
      <span className="vc-body">
        <span className="vc-kind">{VIDEO_KIND_LABEL[video.kind]}</span>
        <b>{video.title}</b>
        <small>{video.role}</small>
      </span>
    </button>
  )
}
