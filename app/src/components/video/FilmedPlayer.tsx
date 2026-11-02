import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { Video } from '../../content/cms.tsx'

const CANT_PLAY =
  "This video can't play right now. Check your connection, or that the media folder is next to this page, then try again."

const TAGS = /<[^>]+>/g

type Props = {
  video: Video
  className?: string
  /** The share of the video played, 0 to 1. */
  onProgress?: (played: number) => void
  /** The caption being spoken; with it, file captions show here instead of on the video. */
  onCaption?: (text: string) => void
  onEnded?: () => void
}

/** A filmed video: from Vimeo once it is there, else the app's own file. */
export default function FilmedPlayer({ className = 'player real', ...props }: Props) {
  return props.video.vimeoId ? (
    <VimeoPlayer className={className} video={props.video} />
  ) : (
    <FilePlayer className={className} {...props} />
  )
}

/** The Vimeo player (do-not-track), loaded only when play is pressed; until then its thumbnail. */
function VimeoPlayer({ video, className, onProgress, onCaption, onEnded }: Props) {
  const frame = useRef<HTMLDivElement>(null)
  const player = useRef<{ destroy(): Promise<void> }>(null)
  const [started, setStarted] = useState(false)
  useEffect(() => () => void player.current?.destroy(), [])

  const play = async () => {
    setStarted(true)
    const { default: Player } = await import('@vimeo/player')
    const vimeo = new Player(frame.current!, {
      id: Number(video.vimeoId),
      dnt: true,
      autoplay: true,
      responsive: true,
      texttrack: 'en',
    })
    player.current = vimeo
    vimeo.on('timeupdate', ({ percent }) => onProgress?.(percent))
    vimeo.on('cuechange', ({ cues }) => onCaption?.(cues[0]?.text.replace(TAGS, '') ?? ''))
    vimeo.on('ended', () => onEnded?.())
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
function FilePlayer({ video, className, onProgress, onCaption, onEnded }: Props) {
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
        onLoadedMetadata={(e) => {
          const track = e.currentTarget.textTracks[0]
          if (!onCaption || !track) return
          track.mode = 'hidden'
          track.oncuechange = () => {
            const cue = track.activeCues?.[0] as VTTCue | undefined
            onCaption(cue ? cue.text.replace(TAGS, '') : '')
          }
        }}
        onTimeUpdate={(e) => {
          const { currentTime, duration } = e.currentTarget
          onProgress?.(duration ? currentTime / duration : 0)
        }}
        onEnded={onEnded}
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
