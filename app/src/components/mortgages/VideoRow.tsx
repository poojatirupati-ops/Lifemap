import type { CSSProperties } from 'react'
import { VIDEOS } from '../explore/videos.data.ts'
import { useMortgagePage } from '../../state/mortgage.ts'
import { VIDEO_PHOTOS, photo, type StoryVideo } from './mortgages.data.ts'

const SHADE = 'linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.45))'

/** The situation's story videos as a scrollable row; picking one plays it below. */
export default function VideoRow({ videos }: { videos: StoryVideo[] }) {
  const { situation, video: current, watched, playVideo } = useMortgagePage()
  const watchedCount = videos.filter((_, i) => watched[`${situation}-${i}`]).length

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
          const poster = VIDEOS.find((video) => video.id === story.videoId)?.poster
          const done = watched[`${situation}-${i}`]
          const playing = i === current
          const art = {
            '--c': story.color,
            backgroundImage: `${SHADE},url(${poster ?? photo(VIDEO_PHOTOS[i % VIDEO_PHOTOS.length])})`,
          } as CSSProperties
          return (
            <button
              key={story.title}
              className={`mp-bu mp-vc${playing ? ' cur' : ''}${done ? ' done' : ''}`}
              data-a="mpvid"
              data-p={i}
              aria-label={story.title + (done ? ', watched' : '')}
              aria-current={playing || undefined}
              onClick={() => playVideo(i)}
            >
              <span className="vc-art" style={art}>
                {!poster && (
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
              {playing && <span className="vc-now">Now playing</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}
