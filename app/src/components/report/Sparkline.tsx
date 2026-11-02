// A decade's savings as a small filled line, coral when any year has a gap.
import { COLOURS } from './tones.ts'

const WIDTH = 128
const HEIGHT = 44
const PAD = 3
const BASE = HEIGHT - PAD

export default function Sparkline({ values, gapYears }: { values: number[]; gapYears: boolean[] }) {
  const highest = Math.max(...values, 0)
  const anyGap = gapYears.some(Boolean)
  const allGap = gapYears.length > 0 && gapYears.every(Boolean)
  const x = (index: number) =>
    values.length === 1 ? WIDTH / 2 : PAD + (index * (WIDTH - 2 * PAD)) / (values.length - 1)
  const y = (value: number) => BASE - (value / highest) * (HEIGHT - 2 * PAD - 2)
  const points = values.map((value, index) => `${x(index).toFixed(1)} ${y(value).toFixed(1)}`)
  const flatY = allGap ? HEIGHT - 14 : BASE - 1
  const colour = anyGap ? COLOURS.coral : COLOURS.tealMid

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
      {!values.length ? null : highest <= 0 ? (
        <line
          x1={PAD}
          y1={flatY}
          x2={WIDTH - PAD}
          y2={flatY}
          stroke={allGap ? COLOURS.coral : COLOURS.grey}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d={`M${x(0).toFixed(1)} ${BASE} L${points.join(' L')} L${x(values.length - 1).toFixed(1)} ${BASE}Z`}
            fill={anyGap ? COLOURS.coralTint : COLOURS.tealTint}
          />
          <path
            d={`M${points.join(' L')}`}
            fill="none"
            stroke={colour}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <line
            x1={PAD}
            y1={BASE}
            x2={WIDTH - PAD}
            y2={BASE}
            stroke={colour}
            strokeWidth={anyGap ? 2.2 : 0}
          />
        </>
      )}
    </svg>
  )
}
