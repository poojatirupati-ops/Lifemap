// How each year is paid: a stacked bar per year, from income, from savings, then a hatched shortfall.
import { Fragment } from 'react'
import AgeTicks from './AgeTicks.tsx'
import ChartZones from './ChartZones.tsx'
import EuroGrid from './EuroGrid.tsx'
import type { ReportData } from '../../report/model/reportData.ts'
import { BOLD, CHART, yOf } from './chart.ts'
import { COLOURS } from './tones.ts'

type PaidData = ReportData['cashflow']['paidChart']
type Bar = PaidData['bars'][number]

const { width, height, left, right, top, bottom } = CHART
const PLOT_HEIGHT = bottom - top
const total = (bar: Bar) => bar.fromIncome + bar.fromSavings + bar.shortfall

/** Each part of a year's bar, stacked from the floor; parts of 0 are left out. */
function stack(bar: Bar, max: number) {
  let floor = bottom
  return [
    { amount: bar.fromIncome, fill: COLOURS.tealMid },
    { amount: bar.fromSavings, fill: COLOURS.gold },
    { amount: bar.shortfall, fill: 'url(#lmrHatch)' },
  ].flatMap(({ amount, fill }) => {
    const barHeight = (amount / max) * PLOT_HEIGHT
    if (barHeight <= 0) return []
    floor -= barHeight
    return [{ y: floor, height: barHeight, fill }]
  })
}

export default function PaidChart({ chart }: { chart: PaidData }) {
  const { bars, yMax, stopMarker, lastLabel } = chart
  if (!bars.length) return null
  const fromAge = bars[0].age
  const toAge = bars.at(-1)!.age
  const slot = (right - left) / bars.length
  const x = (age: number) => left + (age - fromAge) * slot
  const middle = (age: number) => left + (age - fromAge + 0.5) * slot
  const zoneX = (age: number) => (age <= fromAge ? left : age >= toAge ? right : x(age))
  const barWidth = Math.max(1.2, slot - 1.6)
  const nearStop = stopMarker
    ? Math.max(0, ...bars.filter((bar) => Math.abs(bar.age - stopMarker.age) <= 1).map(total))
    : 0

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={chart.caption}
    >
      <defs>
        <pattern
          id="lmrHatch"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="5" height="5" fill={COLOURS.coral} />
          <rect width="2" height="5" fill="#fff" fillOpacity=".38" />
        </pattern>
      </defs>
      <ChartZones zones={chart.zones} x={zoneX} />
      <EuroGrid ticks={chart.yTicks} max={yMax} />
      {bars.map((bar) => (
        <Fragment key={bar.age}>
          {stack(bar, yMax).map((part) => (
            <rect
              key={part.fill}
              x={(middle(bar.age) - barWidth / 2).toFixed(1)}
              y={part.y.toFixed(1)}
              width={barWidth.toFixed(1)}
              height={part.height.toFixed(1)}
              fill={part.fill}
            />
          ))}
        </Fragment>
      ))}
      {stopMarker ? (
        <text
          x={(x(stopMarker.age) - 8).toFixed(1)}
          y={Math.min(yOf(yMax * 0.64, yMax) - 10, yOf(nearStop, yMax) - 14).toFixed(1)}
          textAnchor="end"
          {...BOLD}
          fontSize="12.5"
          fill={COLOURS.navy}
        >
          {stopMarker.label}
        </text>
      ) : null}
      {lastLabel ? (
        <text
          x={right}
          y={(yOf(total(bars.at(-1)!), yMax) - 9).toFixed(1)}
          textAnchor="end"
          {...BOLD}
          fontSize="12.5"
          fill={COLOURS.navy}
        >
          {lastLabel.label}
        </text>
      ) : null}
      <AgeTicks fromAge={fromAge} toAge={toAge} x={middle} />
    </svg>
  )
}
