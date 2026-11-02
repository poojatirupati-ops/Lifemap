import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { pageKey, useMortgagePage } from '../../state/mortgage.ts'
import type { StoryVideo } from '../../content/cms.tsx'
import { VIDEO_PHOTOS, photoAt } from './mortgages.data.ts'

const SHADE = 'linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.45))'

/** The situation's story videos as a scrollable row; picking one plays it below. */
export default function VideoRow({ videos }: { videos: StoryVideo[] }) {
  const situation = useMortgagePage((p) => p.situation)
  const current = useMortgagePage((p) => p.video)
  const watched = useMortgagePage((p) => p.watched)
  const playVideo = useMortgagePage((p) => p.playVideo)
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
          const done = watched[pageKey(situation, i)]
          const playing = i === current
          const art = {
            '--c': story.color,
            backgroundImage: `${SHADE},url(${poster ?? photoAt(VIDEO_PHOTOS, i)})`,
          } as CSSProperties
          return (
            <button
              key={story.title}
              className={clsx('mp-bu mp-vc', { cur: playing, done })}
              data-a="mpvid"
              data-p={i}
              aria-label={`${story.title}${done ? ', watched' : ''}`}
              aria-current={playing || undefined}
              onClick={() => playVideo(i)}
            >
              <span className="vc-art" style={art}>
                {poster ? null : (
                  <i className="vc-badge" aria-hidden="true">
                    {story.emoji}
                  </i>
                )}
                <span className="vc-play" aria-hidden="true">
                  {playing ? '●' : '▶'}
                </span>
                <span className="vc-d">{story.duration}</span>
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
