import { useState, type SyntheticEvent } from 'react'

/** Past this share of the video, "Up next" shows. */
const NEXT_AT = 0.65

const TAGS = /<[^>]+>/g

/**
 * The Mortgages page's filmed video: playback moves the chapter highlight, shows captions under
 * the player, reveals "Up next" near the end and reports the video watched when it ends.
 */
export function useMortgagePlayer(chapters: number, onEnded: () => void) {
  const [chapter, setChapter] = useState(0)
  const [caption, setCaption] = useState('')
  const [nextShown, setNextShown] = useState(false)

  const videoEvents = {
    // Captions show in the line under the player instead of on the video.
    onLoadedMetadata: (e: SyntheticEvent<HTMLVideoElement>) => {
      const track = e.currentTarget.textTracks[0]
      if (!track) return
      track.mode = 'hidden'
      track.oncuechange = () => {
        const cue = track.activeCues?.[0] as VTTCue | undefined
        setCaption(cue ? cue.text.replace(TAGS, '') : '')
      }
    },
    onTimeUpdate: (e: SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget
      const played = video.duration ? video.currentTime / video.duration : 0
      setChapter(Math.min(chapters - 1, Math.floor(played * chapters)))
      if (played > NEXT_AT) setNextShown(true)
    },
    onEnded: () => {
      setNextShown(true)
      onEnded()
    },
  }

  return { videoEvents, chapter, caption, nextShown }
}
