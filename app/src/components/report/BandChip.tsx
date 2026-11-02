import CircleIcon from './CircleIcon.tsx'
import { textOf, weatherIcon } from './tones.ts'

/** "On track", "Nearly there" or "Needs attention" with its weather icon. */
export default function BandChip({ tone, text }: { tone: string; text: string }) {
  return (
    <span className="lmr-chip" style={{ color: textOf(tone) }}>
      <CircleIcon name={weatherIcon(tone)} tone={tone} size={22} iconSize={14} />
      {text}
    </span>
  )
}
