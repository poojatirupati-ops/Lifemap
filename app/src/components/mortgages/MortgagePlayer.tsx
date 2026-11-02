import type { CSSProperties } from 'react'
import { toolById } from '../explore/tools.data.ts'
import { openCalculator } from '../../state/explore.ts'
import { useMortgagePlayer } from '../../hooks/useMortgagePlayer.ts'
import { useMortgagePage } from '../../state/mortgage.ts'
import FilmedPlayer from '../video/FilmedPlayer.tsx'
import type { StoryVideo } from '../../content/cms.tsx'

/** The picked story video: the filmed one when there is one, else a "coming soon" card. */
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
  const { videoEvents, chapter, caption, nextShown } = useMortgagePlayer(
    story.chapters.length,
    markWatched,
  )
  const filmed = story.video
  const stageStyle = { '--c': story.color } as CSSProperties

  return (
    <>
      {filmed ? (
        <div className="mp-st real" style={stageStyle}>
          <FilmedPlayer className="mpplayer" video={filmed} {...videoEvents} />
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
      <div className="mp-next" id="mp-next" hidden={!!filmed?.src && !filmed.vimeoId && !nextShown}>
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
