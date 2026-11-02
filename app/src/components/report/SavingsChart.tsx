// Savings by age: a teal area to the year they run out, then a coral line along the floor.
import AgeTicks from './AgeTicks.tsx'
import ChartZones from './ChartZones.tsx'
import EuroGrid from './EuroGrid.tsx'
import type { ReportData } from '../../report/model/reportData.ts'
import { BOLD, CHART, TEXT, yOf } from './chart.ts'
import { COLOURS } from './tones.ts'

type SavingsData = ReportData['cashflow']['savingsChart']

const { width, height, left, right, top, bottom } = CHART

/** The peak's label sits beside it, or above it when the years before are about as high. */
function peakLabel(chart: SavingsData, x: number, y: number) {
  const peak = chart.peak!
  const before = chart.series.filter((point) => point.age >= peak.age - 4 && point.age < peak.age)
  const plateau =
    before.length > 0 && before.every((point) => point.value >= peak.value * 0.85) && y > top + 34
  if (plateau) {
    const labelX = Math.max(left + 90, Math.min(right, x)).toFixed(1)
    return { x: labelX, y: y - 24, subY: y - 10, anchor: 'end' as const }
  }
  const onLeft = x > left + (right - left) * 0.4
  return {
    x: (onLeft ? x - 14 : x + 14).toFixed(1),
    y: y + 4,
    subY: y + 19,
    anchor: onLeft ? ('end' as const) : ('start' as const),
  }
}

export default function SavingsChart({ chart }: { chart: SavingsData }) {
  const { series, peak, runOut, yMax } = chart
  if (!series.length) return null
  const fromAge = series[0].age
  const toAge = series.at(-1)!.age
  const span = Math.max(1, toAge - fromAge)
  const x = (age: number) => left + ((age - fromAge) / span) * (right - left)
  const shown = runOut ? series.filter((point) => point.age <= runOut.age) : series
  const points = shown.map(
    (point) => `${x(point.age).toFixed(1)} ${yOf(point.value, yMax).toFixed(1)}`,
  )
  const peakX = peak ? x(peak.age) : 0
  const peakY = peak ? yOf(peak.value, yMax) : 0
  const label = peak ? peakLabel(chart, peakX, peakY) : null

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={chart.caption}
    >
      <defs>
        <linearGradient id="lmrSg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLOURS.tealMid} stopOpacity=".45" />
          <stop offset="1" stopColor={COLOURS.tealMid} stopOpacity=".05" />
        </linearGradient>
      </defs>
      <ChartZones zones={chart.zones} x={x} />
      <EuroGrid ticks={chart.yTicks} max={yMax} />
      {shown.length > 1 ? (
        <>
          <path
            d={`M${x(shown[0].age).toFixed(1)} ${bottom} L${points.join(' L')} L${x(shown.at(-1)!.age).toFixed(1)} ${bottom}Z`}
            fill="url(#lmrSg)"
          />
          <path
            d={`M${points.join(' L')}`}
            fill="none"
            stroke={COLOURS.teal}
            strokeWidth="2.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {runOut ? (
        <>
          <line
            x1={x(runOut.age).toFixed(1)}
            y1={bottom}
            x2={right}
            y2={bottom}
            stroke={COLOURS.coral}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <text
            x={right}
            y={bottom - 11}
            textAnchor="end"
            {...BOLD}
            fontSize="12.5"
            fill={COLOURS.coralText}
          >
            {runOut.label}
          </text>
        </>
      ) : null}
      {peak && label ? (
        <>
          <circle
            cx={peakX.toFixed(1)}
            cy={peakY.toFixed(1)}
            r="5.5"
            fill={COLOURS.navy}
            stroke="#fff"
            strokeWidth="2"
          />
          <text
            x={label.x}
            y={label.y.toFixed(1)}
            textAnchor={label.anchor}
            {...BOLD}
            fontSize="13"
            fill={COLOURS.navy}
          >
            {peak.label}
          </text>
          <text
            x={label.x}
            y={label.subY.toFixed(1)}
            textAnchor={label.anchor}
            {...TEXT}
            fontSize="12"
            fill={COLOURS.muted}
          >
            {peak.sub}
          </text>
        </>
      ) : null}
      <AgeTicks fromAge={fromAge} toAge={toAge} x={x} />
    </svg>
  )
}
