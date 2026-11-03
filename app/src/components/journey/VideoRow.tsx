import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { pageKey, useJourneyActions, useJourneyPage } from '../../state/journeyPage.ts'
import type { StoryVideo } from '../../content/cms.tsx'

/** Pictures for cards without a poster or photo of their own, taken in turn. */
const PHOTOS = ['home-keys', 'house-for-sale', 'money-plant', 'invest-charts', 'couple-planning']
const SHADE = 'linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.45))'

/** The situation's story videos as a scrollable row; picking one plays it below. */
export default function VideoRow({
  videos,
  situation,
  current,
}: {
  videos: StoryVideo[]
  situation: number
  current: number
}) {
  const watched = useJourneyPage((p) => p.watched)
  const { actionPrefix, playVideo } = useJourneyActions()
  const watchedCount = videos.filter((_, i) => watched[pageKey(situation, i)]).length

  return (
    <>
      <div className="mp-sec" id="mp-watch">
        <h3>Watch</h3>
        <span id="mp-wc">
          {watchedCount} of {videos.length} watched
        </span>
      </div>
      <div className="mp-bub mp-vrow" role="group" aria-label="Videos">
        {videos.map((story, i) => {
          const poster = story.video?.thumbnailUrl ?? story.video?.poster
          const photo = story.photo ?? PHOTOS[i % PHOTOS.length]
          const done = watched[pageKey(situation, i)]
          const playing = i === current
          const art = {
            '--c': story.color,
            backgroundImage: `${SHADE},url(${poster ?? `/media/${photo}.jpg`})`,
          } as CSSProperties
          return (
            <button
              key={story.title}
              className={clsx('mp-bu mp-vc', { cur: playing, done })}
              data-a={`${actionPrefix}vid`}
              data-p={i}
              aria-label={`${story.title}${done ? ', watched' : ''}`}
              aria-current={playing || undefined}
              onClick={() => playVideo(i)}
            >
              <span className="vc-art" style={art}>
                {poster || story.photo ? null : (
                  <i className="vc-badge" aria-hidden="true">
                    {story.emoji}
                  </i>
                )}
                <span className="vc-play" aria-hidden="true">
                  {playing ? '●' : '▶'}
                </span>
                {story.duration ? <span className="vc-d">{story.duration}</span> : null}
                <b className="vc-ok" aria-hidden="true">
                  ✓
                </b>
              </span>
              <span className="vc-t">{story.short}</span>
              {playing ? <span className="vc-now">Now playing</span> : null}
            </button>
          )
        })}
      </div>
    </>
  )
}
