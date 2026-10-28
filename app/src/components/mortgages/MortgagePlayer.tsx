import type { CSSProperties } from 'react'
import { toolById } from '../explore/explore.data.ts'
import { openCalculator } from '../explore/exploreActions.ts'
import { VIDEOS } from '../explore/videos.data.ts'
import { useMortgagePlayer } from '../../hooks/useMortgagePlayer.ts'
import { useMortgagePage } from '../../state/mortgage.ts'
import type { StoryVideo } from './mortgages.data.ts'

const CANT_PLAY =
  "This video can't play right now. Check your connection, or that the media folder is next to this page, then try again."

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
  const { videoRef, retryRef, videoEvents, chapter, caption, nextShown, failed, retry } =
    useMortgagePlayer(story.chapters.length, markWatched)
  const filmed = VIDEOS.find((video) => video.id === story.videoId && video.src)
  const stageStyle = { '--c': story.color } as CSSProperties

  return (
    <>
      {filmed ? (
        <div className="mp-st real" style={stageStyle}>
          <div className="mpplayer" data-vwrap={filmed.id}>
            <video
              ref={videoRef}
              id="vid-el"
              data-vid={filmed.id}
              controls
              preload="metadata"
              playsInline
              poster={filmed.poster}
              src={filmed.src}
              aria-label={filmed.title}
              aria-describedby="vid-cap"
              hidden={failed}
              {...videoEvents}
            >
              {filmed.captions && (
                <track kind="captions" srcLang="en" label="English" src={filmed.captions} default />
              )}
            </video>
            <div className="vfail" id="vid-fail" role="alert" hidden={!failed}>
              <b>{CANT_PLAY}</b>
              <button
                ref={retryRef}
                className="btn sm"
                data-a="vretry"
                data-p={filmed.id}
                style={{ marginTop: 8 }}
                onClick={retry}
              >
                Try again
              </button>
            </div>
          </div>
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
