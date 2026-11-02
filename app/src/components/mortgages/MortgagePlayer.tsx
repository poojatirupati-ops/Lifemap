import { useState, type CSSProperties } from 'react'
import { toolById } from '../explore/tools.data.ts'
import { openCalculator } from '../../state/explore.ts'
import { useMortgagePage } from '../../state/mortgage.ts'
import FilmedPlayer from '../video/FilmedPlayer.tsx'
import type { StoryVideo } from '../../content/cms.tsx'

/** Past this share of the video, "Up next" shows. */
const NEXT_AT = 0.65

/**
 * The picked story video: the filmed one when there is one, else a "coming soon" card. Playback
 * moves the chapter highlight, shows captions under the player, reveals "Up next" near the end
 * and reports the video watched when it ends.
 */
export default function MortgagePlayer({
  story,
  number,
  count,
}: {
  story: StoryVideo
  number: number
  count: number
}) {
  const markWatched = useMortgagePage((page) => page.markWatched)
  const [chapter, setChapter] = useState(0)
  const [caption, setCaption] = useState('')
  const [nextShown, setNextShown] = useState(false)
  const chapters = story.chapters.length
  const filmed = story.video
  const stageStyle = { '--c': story.color } as CSSProperties

  return (
    <>
      {filmed ? (
        <div className="mp-st real" style={stageStyle}>
          <FilmedPlayer
            className="mpplayer"
            video={filmed}
            onCaption={setCaption}
            onProgress={(played) => {
              setChapter(Math.min(chapters - 1, Math.floor(played * chapters)))
              if (played > NEXT_AT) setNextShown(true)
            }}
            onEnded={() => {
              setNextShown(true)
              markWatched()
            }}
          />
        </div>
      ) : (
        <div className="mp-st" style={stageStyle}>
          <span className="art" aria-hidden="true">
            {story.emoji}
          </span>
          <div className="tp">
            Video {number} of {count} · {story.duration}
          </div>
          <h4>{story.title}</h4>
          <span className="soon">Coming soon</span>
        </div>
      )}
      <p className="mp-cap" id="mp-cap" aria-live="polite">
        {filmed ? caption : 'We are filming this one. Check back soon.'}
      </p>
      <div className="mp-chap" id="mp-chap" aria-label="Chapters">
        {story.chapters.map((name, i) => (
          <span key={name} className={i === chapter ? 'on' : undefined}>
            {name}
          </span>
        ))}
      </div>
      <div className="mp-next" id="mp-next" hidden={!!filmed && !nextShown}>
        <span>Up next: try it with your numbers</span>
        <button
          className="btn sm"
          data-a="calc"
          data-p={story.tool}
          onClick={() => openCalculator(story.tool)}
        >
          {toolById(story.tool).name} →
        </button>
      </div>
    </>
  )
}
