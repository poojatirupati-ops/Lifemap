import { useEffect, useRef, useState } from 'react'

/** Past this share of the video, "Up next" shows. */
const NEXT_AT = 0.65

/** Show the captions in the line under the player instead of on the video. */
function captionsBelow(video: HTMLVideoElement | null, show: (text: string) => void) {
  const track = video?.textTracks[0]
  if (!track) return
  track.mode = 'hidden'
  track.oncuechange = () => {
    const cue = track.activeCues?.[0] as VTTCue | undefined
    show(cue ? cue.text.replace(/<[^>]+>/g, '') : '')
  }
}

/**
 * The Mortgages page's filmed video: playback moves the chapter highlight, shows captions under
 * the player, reveals "Up next" near the end and reports the video watched when it ends.
 */
export function useMortgagePlayer(chapters: number, onEnded: () => void) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const retryRef = useRef<HTMLButtonElement>(null)
  const [chapter, setChapter] = useState(0)
  const [caption, setCaption] = useState('')
  const [nextShown, setNextShown] = useState(false)
  const [failed, setFailed] = useState(false)
  const focusRetry = useRef(false)

  useEffect(() => captionsBelow(videoRef.current, setCaption), [])

  useEffect(() => {
    if (failed && focusRetry.current) retryRef.current?.focus()
  }, [failed])

  const videoEvents = {
    onLoadedMetadata: () => captionsBelow(videoRef.current, setCaption),
    onTimeUpdate: () => {
      const video = videoRef.current!
      const played = video.duration ? video.currentTime / video.duration : 0
      setChapter(Math.min(chapters - 1, Math.floor(played * chapters)))
      if (played > NEXT_AT) setNextShown(true)
    },
    onEnded: () => {
      setNextShown(true)
      onEnded()
    },
    onError: () => {
      focusRetry.current = document.activeElement === videoRef.current
      setFailed(true)
    },
  }

  const retry = () => {
    setFailed(false)
    videoRef.current?.load()
  }

  return { videoRef, retryRef, videoEvents, chapter, caption, nextShown, failed, retry }
}
