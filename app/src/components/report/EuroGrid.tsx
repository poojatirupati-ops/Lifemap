// A chart's euro gridlines with their labels on the left.
import { Fragment } from 'react'
import { CHART, TEXT, axisLabel, yOf } from './chart.ts'
import { COLOURS } from './tones.ts'

export default function EuroGrid({ ticks, max }: { ticks: number[]; max: number }) {
  return ticks.map((tick) => {
    const y = yOf(tick, max)
    return (
      <Fragment key={tick}>
        <line
          x1={CHART.left}
          y1={y.toFixed(1)}
          x2={CHART.right}
          y2={y.toFixed(1)}
          stroke="#fff"
          strokeWidth="1.4"
        />
        <text
          x={CHART.left - 12}
          y={(y + 4).toFixed(1)}
          textAnchor="end"
          {...TEXT}
          fontSize="12"
          fill={COLOURS.muted}
        >
          {axisLabel(tick)}
        </text>
      </Fragment>
    )
  })
}
