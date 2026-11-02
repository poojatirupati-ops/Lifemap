import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { flushSync } from 'react-dom'
import type { Video } from '../../content/cms.tsx'

const CANT_PLAY =
  "This video can't play right now. Check your connection, or that the media folder is next to this page, then try again."

type Props = {
  video: Video
  className?: string
} & Pick<ComponentProps<'video'>, 'onLoadedMetadata' | 'onTimeUpdate' | 'onEnded'>

/** A filmed video: from Vimeo once it is there, else the app's own file. */
export default function FilmedPlayer({ className = 'player real', ...props }: Props) {
  return props.video.vimeoId ? (
    <VimeoPlayer className={className} video={props.video} />
  ) : (
    <FilePlayer className={className} {...props} />
  )
}

/**
 * The Vimeo player (do-not-track), loaded only when play is pressed; until then its thumbnail.
 * ponytail: the Mortgages page's chapter and caption sync listen to <video> events, so on Vimeo
 * they stay still; wire player.on('timeupdate' | 'cuechange' | 'ended') there when videos move.
 */
function VimeoPlayer({ video, className }: { video: Video; className: string }) {
  const frame = useRef<HTMLDivElement>(null)
  const player = useRef<{ destroy(): Promise<void> }>(null)
  const [started, setStarted] = useState(false)
  useEffect(() => () => void player.current?.destroy(), [])

  const play = async () => {
    setStarted(true)
    const { default: Player } = await import('@vimeo/player')
    player.current = new Player(frame.current!, {
      id: Number(video.vimeoId),
      dnt: true,
      autoplay: true,
      responsive: true,
      texttrack: 'en',
    })
  }

  return (
    <div className={className} data-vwrap={video.id}>
      <div ref={frame} aria-label={video.title} />
      {started ? null : (
        <button
          className="vthumb"
          aria-label={`Play: ${video.title}`}
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            backgroundImage: `url(${video.thumbnailUrl ?? video.poster})`,
            backgroundSize: 'cover',
          }}
          onClick={play}
        >
          <span className="play" aria-hidden="true">
            ▶
          </span>
        </button>
      )}
    </div>
  )
}

/** A real video file with native controls; if it cannot play, a message with Try again replaces it. */
function FilePlayer({ video, className, ...videoEvents }: Props) {
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
        poster={video.poster ?? undefined}
        src={video.src ?? undefined}
        crossOrigin={video.captions ? 'anonymous' : undefined}
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
