import { useEffect, useRef, type CSSProperties } from 'react'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import { TOPICS } from './explore.data.ts'
import { focusAreaOf, openTopic, showFocusArea } from './exploreActions.ts'
import { useCardSwipe } from './useCardSwipe.ts'
import { VIDEOS } from './videos.data.ts'

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** Focus on one area: chips, a swipeable photo card for the chosen area, and arrows with dots. */
export default function FocusArea() {
  const index = useStore((store) => focusAreaOf(store.plan))
  const { swipe, card, back, cardHandlers, onKeyDown } = useCardSwipe(
    TOPICS.length,
    index,
    showFocusArea,
  )
  const chips = useRef<HTMLDivElement>(null)
  const topic = TOPICS[index]
  const next = TOPICS[(index + 1) % TOPICS.length]
  const videoCount = VIDEOS.filter((video) => video.kind === topic.expert).length
  const cardStyle = {
    '--art': `var(--art-${topic.art})`,
    '--pos': topic.photoPosition,
  } as CSSProperties

  useEffect(() => {
    const chip = chips.current?.querySelector<HTMLElement>('.sel')
    if (chip && index) chips.current!.scrollTo({ left: chip.offsetLeft - 18, behavior: 'smooth' })
  }, [index])

  return (
    <>
      <div className="chips xchips" role="group" aria-label="Choose an area" ref={chips}>
        {TOPICS.map((area, i) => (
          <button
            key={area.name}
            className={i === index ? 'chip sel' : 'chip'}
            aria-pressed={i === index}
            data-a="xfeat"
            data-p={i}
            onClick={() => showFocusArea(i)}
          >
            {area.name}
          </button>
        ))}
      </div>
      <div className="xhero" onKeyDown={onKeyDown}>
        <span
          className="xh-back"
          aria-hidden="true"
          style={{ backgroundImage: `var(--art-${next.art})` }}
          ref={back}
        ></span>
        <button
          className="xh-card"
          data-a="topic"
          data-p={topic.name}
          style={cardStyle}
          ref={card}
          onClick={() => openTopic(topic.name)}
          {...cardHandlers}
        >
          <span className="art" aria-hidden="true"></span>
          <span className="scrim" aria-hidden="true"></span>
          <span className="xh-tx">
            <small>
              <Emo>{`${topic.emoji} Focus area`}</Emo>
            </small>
            <b>{topic.name}</b>
            <span className="xh-meta">
              <span className="xh-pill">{plural(topic.tools.length, 'tool')}</span>
              {videoCount ? plural(videoCount, 'video') : topic.blurb}
            </span>
          </span>
          <span className="xh-more">
            <span>See more</span>
            <span className="xh-go" aria-hidden="true">
              ›
            </span>
          </span>
        </button>
      </div>
      <div className="xh-nav">
        <button
          className="xh-arr"
          data-a="xswipe"
          data-p="-1"
          aria-label="Previous area"
          onClick={() => swipe(-1)}
        >
          ‹
        </button>
        <span className="xh-dots" aria-hidden="true">
          {TOPICS.map((area, i) => (
            <i key={area.name} className={i === index ? 'on' : undefined}></i>
          ))}
        </span>
        <span className="xh-hint" aria-hidden="true">
          Swipe to explore
        </span>
        <button
          className="xh-arr"
          data-a="xswipe"
          data-p="1"
          aria-label="Next area"
          onClick={() => swipe(1)}
        >
          ›
        </button>
      </div>
    </>
  )
}
