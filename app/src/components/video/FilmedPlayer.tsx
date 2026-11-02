import { useRef, useState, type ComponentProps } from 'react'
import { flushSync } from 'react-dom'
import type { Video } from '../explore/videos.data.ts'

const CANT_PLAY =
  "This video can't play right now. Check your connection, or that the media folder is next to this page, then try again."

/** A real video file with native controls; if it cannot play, a message with Try again replaces it. */
export default function FilmedPlayer({
  video,
  className = 'player real',
  ...videoEvents
}: {
  video: Video
  className?: string
} & Pick<ComponentProps<'video'>, 'onLoadedMetadata' | 'onTimeUpdate' | 'onEnded'>) {
  const [failed, setFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const retryRef = useRef<HTMLButtonElement>(null)

  const onError = () => {
    const hadFocus = document.activeElement === videoRef.current
    flushSync(() => setFailed(true))
    if (hadFocus) retryRef.current?.focus()
  }
  const retry = () => {
    setFailed(false)
    videoRef.current?.load()
  }

  return (
    <div className={className} data-vwrap={video.id}>
      <video
        ref={videoRef}
        id="vid-el"
        data-vid={video.id}
        controls
        preload="metadata"
        playsInline
        poster={video.poster}
        src={video.src}
        aria-label={video.title}
        aria-describedby="vid-cap"
        hidden={failed}
        onError={onError}
        {...videoEvents}
      >
        {video.captions ? (
          <track kind="captions" srcLang="en" label="English" src={video.captions} default />
        ) : null}
      </video>
      <div className="vfail" id="vid-fail" role="alert" hidden={!failed}>
        <b>{CANT_PLAY}</b>
        <button
          ref={retryRef}
          className="btn sm"
          data-a="vretry"
          data-p={video.id}
          style={{ marginTop: 8 }}
          onClick={retry}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
