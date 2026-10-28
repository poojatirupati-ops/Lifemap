import type { Opt } from '../../content/discover.data.ts'
import Emoji from '../ui/Emoji.tsx'

/** Tap card: emoji, answer, money-term tag, plain-English line. */
export default function DiscoverOption({ o, selected, onPick }: { o: Opt; selected: boolean; onPick: () => void }) {
  return (
    <button type="button" className="opt" aria-pressed={selected} onClick={onPick}>
      <Emoji>{o.e}</Emoji>
      <span>
        <strong>{o.t}</strong>
        <small className="eyebrow">{o.tag}</small>
        <small>{o.line}</small>
      </span>
    </button>
  )
}
