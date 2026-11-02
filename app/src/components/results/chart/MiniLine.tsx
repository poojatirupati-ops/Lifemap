import { euro } from '../../../lib/format.ts'
import Emo from '../../ui/Emo.tsx'

interface Props {
  label: string
  amount: number
  colour?: string
}

/** A label and amount on one line, with an optional colour swatch matching the chart. */
export default function MiniLine({ label, amount, colour }: Props) {
  return (
    <div className="mini">
      <span>
        {colour ? <i className="sw" style={{ background: colour, marginRight: 6 }} /> : null}
        <Emo>{label}</Emo>
      </span>
      <b>{euro(amount)}</b>
    </div>
  )
}
