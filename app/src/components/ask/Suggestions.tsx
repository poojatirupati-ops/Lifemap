import type { Topic } from './topics.tsx'

interface Props {
  topics: Topic[]
  /** something was asked already */
  asked: boolean
  showAll: boolean
  onAsk: (topic: Topic) => void
  onMore: () => void
}

const FIRST = 4

/** Suggested questions not asked yet: four, then all of them on "More questions". */
export default function Suggestions({ topics, asked, showAll, onAsk, onMore }: Props) {
  const shown = showAll ? topics : topics.slice(0, FIRST)
  return (
    <div className="chat-sug">
      {asked ? <small>You could also ask</small> : null}
      {shown.map((topic) => (
        <button className="cs" key={topic.key} onClick={() => onAsk(topic)}>
          {topic.question}
        </button>
      ))}
      {!showAll && topics.length > FIRST ? (
        <button className="cs more" onClick={onMore}>
          More questions
        </button>
      ) : null}
    </div>
  )
}
