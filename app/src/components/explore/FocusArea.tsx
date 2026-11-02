import { useEffect, useRef } from 'react'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import { topicPhotoStyle, topicVideos } from './explore.data.ts'
import { openTopic, showFocusArea } from '../../state/explore.ts'
import { useCardSwipe, wrap } from './useCardSwipe.ts'
import { useTopics, useVideos } from '../../content/cms.tsx'

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** Focus on one area: chips, a swipeable photo card for the chosen area, and arrows with dots. */
export default function FocusArea() {
  const index = useStore((store) => store.focusArea ?? 0)
  const topics = useTopics()
  const videos = useVideos()
  const { swipe, card, back, bind, onKeyDown } = useCardSwipe(topics.length, index, showFocusArea)
  const chips = useRef<HTMLDivElement>(null)
  const topic = topics[index]
  const next = topics[wrap(index + 1, topics.length)]
  const videoCount = topic ? topicVideos(topic, videos).length : 0

  useEffect(() => {
    const strip = chips.current
    const chip = strip?.querySelector<HTMLElement>('.sel')
    // scrollTo is optional only for jsdom, which has none
    if (strip && chip) strip.scrollTo?.({ left: chip.offsetLeft - 18, behavior: 'smooth' })
  }, [index])

  if (!topic) return null
  const arrow = (step: 1 | -1) => (
    <button
      className="xh-arr"
      data-a="xswipe"
      data-p={step}
      aria-label={step > 0 ? 'Next area' : 'Previous area'}
      onClick={() => swipe(step)}
    >
      {step > 0 ? '›' : '‹'}
    </button>
  )
  return (
    <>
      <div className="chips xchips" role="group" aria-label="Choose an area" ref={chips}>
        {topics.map((area, i) => (
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
          style={topicPhotoStyle(topic)}
          ref={card}
          onClick={() => openTopic(topic.name)}
          {...bind()}
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
        {arrow(-1)}
        <span className="xh-dots" aria-hidden="true">
          {topics.map((area, i) => (
            <i key={area.name} className={i === index ? 'on' : undefined}></i>
          ))}
        </span>
        <span className="xh-hint" aria-hidden="true">
          Swipe to explore
        </span>
        {arrow(1)}
      </div>
    </>
  )
}
