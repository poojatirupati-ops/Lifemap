// The cashflow page's two charts: savings by age and how each year is paid. Both share one frame
// (649 x 300, plotted inside these edges), background bands, euro gridlines and age ticks.
import { Fragment, type ReactNode } from 'react'
import type { ReportData } from '../../report/model/reportData.ts'
import { COLOURS, textOf } from './tones.ts'

const [width, height, left, right, top, bottom] = [649, 300, 54, 640, 31, 269]

type Zone = ReportData['cashflow']['savingsChart']['zones'][number]

/** y of an amount on an axis from 0 to `max`, kept inside the plot. */
const yOf = (amount: number, max: number) =>
  bottom - Math.max(0, Math.min(1, amount / max)) * (bottom - top)

/** €0, €250k, €1.5m */
const axisLabel = (amount: number) =>
  amount === 0 ? '€0' : amount >= 1e6 ? `€${amount / 1e6}m` : `€${amount / 1000}k`

const TEXT = { fontFamily: 'Figtree,sans-serif' }
const BOLD = { fontFamily: 'Figtree,sans-serif', fontWeight: 800 }

const ZONE_COLOURS: Record<string, string> = {
  good: COLOURS.tealTint2,
  gold: '#f8f3e3',
  coral: '#f7ece9',
}
const ZONE_TOP = top - 3

interface ChartFrameProps {
  chart: { caption: string; zones: Zone[]; yTicks: number[]; yMax: number }
  defs: ReactNode
  /** x of an age for the bands, and for the age ticks */
  zoneX: (age: number) => number
  tickX: (age: number) => number
  fromAge: number
  toAge: number
  children: ReactNode
}

/** The chart's frame: background bands (working, on savings, a gap) with their labels, euro
 * gridlines labelled on the left, the plot, then every decade's age along the bottom. */
function ChartFrame({ chart, defs, zoneX, tickX, fromAge, toAge, children }: ChartFrameProps) {
  const { zones, yMax } = chart
  const decades = []
  for (let age = Math.ceil(fromAge / 10) * 10; age <= toAge; age += 10) decades.push(age)
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={chart.caption}
    >
      <defs>{defs}</defs>
      {zones.map((zone) => (
        <rect
          key={`band ${zone.fromAge}`}
          x={zoneX(zone.fromAge).toFixed(1)}
          y={ZONE_TOP}
          width={Math.max(0, zoneX(zone.toAge) - zoneX(zone.fromAge)).toFixed(1)}
          height={bottom - ZONE_TOP}
          fill={ZONE_COLOURS[zone.tone] ?? '#eee'}
        />
      ))}
      {zones.map((zone) =>
        zone.label ? (
          <text
            key={`label ${zone.fromAge}`}
            x={((zoneX(zone.fromAge) + zoneX(zone.toAge)) / 2).toFixed(1)}
            y={18}
            textAnchor="middle"
            {...BOLD}
            fontSize="12"
            letterSpacing="1.4"
            fill={textOf(zone.tone)}
          >
            {zone.label}
          </text>
        ) : null,
      )}
      {chart.yTicks.map((tick) => {
        const y = yOf(tick, yMax)
        return (
          <Fragment key={tick}>
            <line
              x1={left}
              y1={y.toFixed(1)}
              x2={right}
              y2={y.toFixed(1)}
              stroke="#fff"
              strokeWidth="1.4"
            />
            <text
              x={left - 12}
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
      })}
      {children}
      {decades.map((age) => (
        <text
          key={age}
          x={tickX(age).toFixed(1)}
          y={bottom + 23}
          textAnchor="middle"
          {...TEXT}
          fontSize="12.5"
          fill={COLOURS.muted}
        >
          {age}
        </text>
      ))}
    </svg>
  )
}

// Savings by age: a teal area to the year they run out, then a coral line along the floor.

type SavingsData = ReportData['cashflow']['savingsChart']

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

export function SavingsChart({ chart }: { chart: SavingsData }) {
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
    <ChartFrame
      chart={chart}
      zoneX={x}
      tickX={x}
      fromAge={fromAge}
      toAge={toAge}
      defs={
        <linearGradient id="lmrSg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLOURS.tealMid} stopOpacity=".45" />
          <stop offset="1" stopColor={COLOURS.tealMid} stopOpacity=".05" />
        </linearGradient>
      }
    >
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
    </ChartFrame>
  )
}

// How each year is paid: a stacked bar per year, from income, from savings, then a hatched shortfall.

type PaidData = ReportData['cashflow']['paidChart']
type Bar = PaidData['bars'][number]

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

export function PaidChart({ chart }: { chart: PaidData }) {
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
    <ChartFrame
      chart={chart}
      zoneX={zoneX}
      tickX={middle}
      fromAge={fromAge}
      toAge={toAge}
      defs={
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
      }
    >
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
    </ChartFrame>
  )
}
