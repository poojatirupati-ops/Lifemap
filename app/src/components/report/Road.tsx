// The road from today to the plan's end: coloured stretches on a gentle S-wave, milestones on stems.
import { Fragment } from 'react'
import type { ReportData } from '../../report/model/reportData.ts'
import { COLOURS, fillOf } from './tones.ts'

type RoadData = ReportData['road']
type Milestone = RoadData['milestones'][number]

// the wave as [share of the way along, height], eased between points (cubic Hermite)
const WAVE = [
  [0, 0],
  [0.21, 43],
  [0.43, -11],
  [0.61, -53],
  [0.74, -37],
  [1, 30],
]

function waveHeight(along: number) {
  let i = 0
  while (i < WAVE.length - 2 && along > WAVE[i + 1][0]) i++
  const [before, from, to, after] = [i - 1, i, i + 1, i + 2].map(
    (index) => WAVE[Math.min(WAVE.length - 1, Math.max(0, index))],
  )
  const width = to[0] - from[0]
  const u = Math.max(0, Math.min(1, (along - from[0]) / width))
  const slopeFrom = ((to[1] - before[1]) / (to[0] - before[0])) * width
  const slopeTo = ((after[1] - from[1]) / (after[0] - from[0])) * width
  const u2 = u * u
  const u3 = u2 * u
  return (
    (2 * u3 - 3 * u2 + 1) * from[1] +
    (u3 - 2 * u2 + u) * slopeFrom +
    (-2 * u3 + 3 * u2) * to[1] +
    (u3 - u2) * slopeTo
  )
}

/** Milestones in age order; a label flips side when it would sit within 120px of the last one. */
function placeMilestones(milestones: Milestone[], x: (age: number) => number) {
  let lastSide = ''
  let lastX = -999
  return milestones
    .toSorted((a, b) => a.age - b.age)
    .map((milestone) => {
      let side = milestone.side === 'below' ? 'below' : 'above'
      const mx = x(milestone.age)
      if (side === lastSide && Math.abs(mx - lastX) < 120)
        side = side === 'above' ? 'below' : 'above'
      lastSide = side
      lastX = mx
      return { ...milestone, above: side === 'above' }
    })
}

const ROAD_TEXT = { fontFamily: 'Figtree,sans-serif', fontWeight: 800 }

/** Where a road sits on its picture, and its colours. */
export interface RoadLayout {
  width: number
  height: number
  /** x of the start and end ages */
  startX: number
  endX: number
  /** y of the wave's middle, and how far the wave swings (1 = as drawn) */
  middleY: number
  swing: number
  /** how far a milestone's badge sits from the road */
  stem: number
  endLabelX: number
  glow: string
  stemColor: string
  labelColor: string
  subColor: string
  endColor: string
  /** milestones show their label and age under the badge */
  labels: boolean
}

export default function Road({ road, layout }: { road: RoadData; layout: RoadLayout }) {
  const { width, height, startX, endX, middleY, swing, stem, labelColor } = layout
  const span = Math.max(1, road.endAge - road.startAge)
  const along = (age: number) => (age - road.startAge) / span
  const x = (age: number) => startX + along(age) * (endX - startX)
  const y = (age: number) => middleY + waveHeight(along(age)) * swing
  const at = (age: number) => ({ cx: x(age).toFixed(1), cy: y(age).toFixed(1) })
  const path = (from: number, to: number) => {
    const steps = Math.max(6, Math.round(((to - from) / span) * 120))
    return Array.from({ length: steps + 1 }, (_, i) => {
      const age = from + ((to - from) * i) / steps
      return `${i ? 'L' : 'M'}${x(age).toFixed(1)} ${y(age).toFixed(1)}`
    }).join('')
  }
  const { segments } = road
  const last = segments.at(-1)

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Your road from age ${road.startAge} to ${road.endAge}`}
    >
      <path
        d={path(road.startAge, road.endAge)}
        stroke={layout.glow}
        strokeWidth="22"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {segments.map((segment, index) => (
        <path
          key={index}
          d={path(segment.fromAge, segment.toAge)}
          stroke={fillOf(segment.tone)}
          strokeWidth="10"
          fill="none"
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
      ))}
      {last ? (
        <>
          <circle {...at(segments[0].fromAge)} r="5" fill={fillOf(segments[0].tone)} />
          <circle {...at(last.toAge)} r="5" fill={fillOf(last.tone)} />
        </>
      ) : null}
      <circle {...at(road.startAge)} r="8.5" fill="#fff" stroke={COLOURS.navy} strokeWidth="3" />
      {placeMilestones(road.milestones, x).map((milestone, index) => {
        // a dot on the road, a dashed stem, a badge and (optionally) its label
        const mx = x(milestone.age).toFixed(1)
        const roadY = y(milestone.age)
        const badgeY = milestone.above ? roadY - stem : roadY + stem
        const labelY = milestone.above ? badgeY - 38 : badgeY + 33
        const colour = fillOf(milestone.tone)
        return (
          <Fragment key={index}>
            <line
              x1={mx}
              y1={milestone.above ? badgeY + 15 : badgeY - 15}
              x2={mx}
              y2={roadY.toFixed(1)}
              stroke={layout.stemColor}
              strokeWidth="1.2"
              strokeDasharray="2 3"
            />
            <circle
              cx={mx}
              cy={roadY.toFixed(1)}
              r="5.2"
              fill="#fff"
              stroke={colour}
              strokeWidth="2.5"
            />
            <circle
              cx={mx}
              cy={badgeY.toFixed(1)}
              r="15"
              fill="#fff"
              stroke={colour}
              strokeWidth="4"
            />
            <text
              x={mx}
              y={(badgeY + 4.6).toFixed(1)}
              textAnchor="middle"
              {...ROAD_TEXT}
              fontSize="13"
              fill={COLOURS.navy}
            >
              {milestone.badge}
            </text>
            {layout.labels ? (
              <>
                <text
                  x={mx}
                  y={labelY}
                  textAnchor="middle"
                  {...ROAD_TEXT}
                  fontSize="14"
                  fill={labelColor}
                >
                  {milestone.label}
                </text>
                <text
                  x={mx}
                  y={labelY + 16}
                  textAnchor="middle"
                  fontFamily={ROAD_TEXT.fontFamily}
                  fontSize="12"
                  fill={layout.subColor}
                >
                  {milestone.sub}
                </text>
              </>
            ) : null}
          </Fragment>
        )
      })}
      <text x={startX - 8} y={height - 6} {...ROAD_TEXT} fontSize="13" fill={labelColor}>
        {road.startLabel}
      </text>
      <text
        x={layout.endLabelX}
        y={height - 6}
        textAnchor="end"
        {...ROAD_TEXT}
        fontSize="13"
        fill={layout.endColor}
      >
        {road.endLabel}
      </text>
    </svg>
  )
}
