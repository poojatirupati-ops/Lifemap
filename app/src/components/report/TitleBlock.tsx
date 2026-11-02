// A page's big number beside its eyebrow, title and lead.
import { textOf } from './tones.ts'

interface TitleBlockProps {
  big: string
  bigTone?: string
  bigLabel?: string
  eyebrow?: string
  title: string
  lead?: string
}

/** Long numbers shrink so they keep to one line (never below 34px). */
const bigSize = (big: string) =>
  big.length > 8 ? Math.max(34, Math.round((64 * 8) / big.length)) : undefined

export default function TitleBlock({
  big,
  bigTone,
  bigLabel,
  eyebrow,
  title,
  lead,
}: TitleBlockProps) {
  return (
    <div className="lmr-tb">
      <div className="lmr-bn">
        <div className="lmr-bnum" style={{ color: textOf(bigTone), fontSize: bigSize(big) }}>
          {big}
        </div>
        {bigLabel ? <div className="lmr-bl">{bigLabel}</div> : null}
      </div>
      <div className="lmr-tx">
        {eyebrow ? <div className="lmr-ey">{eyebrow}</div> : null}
        <h1 className="lmr-title">{title}</h1>
        {lead ? <p className="lmr-lead">{lead}</p> : null}
      </div>
    </div>
  )
}
