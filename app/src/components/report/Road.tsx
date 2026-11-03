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

type Side = 'above' | 'below'
type Extent = [number, number]

/**
 * Milestones in age order, each label on the side and level with room: the preferred side alternates,
 * then the other side, then one level further out on either. No two labels overlap.
 */
function placeMilestones(milestones: Milestone[], x: (age: number) => number, labels: boolean) {
  const placed: Record<Side, [Extent[], Extent[]]> = { above: [[], []], below: [[], []] }
  const extent = (milestone: Milestone): Extent => {
    const half = labels
      ? Math.max(
          String(milestone.label).length * 7.6,
          String(milestone.sub || '').length * 6.4,
          34,
        ) /
          2 +
        7
      : 20
    const mx = x(milestone.age)
    return [mx - half, mx + half]
  }
  const free = (list: Extent[], [from, to]: Extent) =>
    list.every(([left, right]) => to < left || from > right)
  return milestones
    .toSorted((a, b) => a.age - b.age)
    .map((milestone, index) => {
      const own = extent(milestone)
      const mx = x(milestone.age)
      const preferred: Side = index % 2 ? 'below' : 'above'
      const other: Side = preferred === 'above' ? 'below' : 'above'
      const choices: [Side, 0 | 1][] = [
        [preferred, 0],
        [other, 0],
        [preferred, 1],
        [other, 1],
      ]
      // the outer level only where the inner one leaves room for its stem
      const [side, level] = choices.find(
        ([side, level]) =>
          (level === 0 || free(placed[side][0], [mx - 8, mx + 8])) &&
          free(placed[side][level], own),
      ) ?? [preferred, 1]
      placed[side][level].push(own)
      return { ...milestone, above: side === 'above', level }
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
  /** the start dot's fill and ring */
  dot: string
  dotStroke: string
  /** the picture crops to what is drawn (viewBox from the top label to the bottom one) */
  fit: boolean
}

export default function Road({ road, layout }: { road: RoadData; layout: RoadLayout }) {
  const { width, startX, endX, middleY, swing, stem, labelColor, labels } = layout
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
  // a milestone's badge sits a stem away from the road, one level further out when it must
  const milestones = placeMilestones(road.milestones, x, labels).map((milestone) => {
    const roadY = y(milestone.age)
    const distance = stem + milestone.level * (labels ? 76 : 36)
    const badgeY = milestone.above ? roadY - distance : roadY + distance
    return { ...milestone, roadY, badgeY, labelY: milestone.above ? badgeY - 38 : badgeY + 33 }
  })
  const top = Math.min(
    1e9,
    ...milestones.map((m) => (labels && m.above ? m.labelY - 14 : m.badgeY - 15)),
  )
  const bottom = Math.max(
    -1e9,
    ...milestones.map((m) => (labels && !m.above ? m.labelY + 20 : m.badgeY + 15)),
  )
  const viewTop = Math.min(top, middleY - 20) - 10
  const viewBottom = Math.max(bottom, middleY + 60) + 34
  const height = layout.fit ? viewBottom : layout.height

  return (
    <svg
      width={width}
      height={layout.height}
      viewBox={
        layout.fit
          ? `0 ${viewTop.toFixed(0)} ${width} ${(viewBottom - viewTop).toFixed(0)}`
          : `0 0 ${width} ${layout.height}`
      }
      preserveAspectRatio={layout.fit ? 'xMidYMid meet' : undefined}
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
      <circle
        {...at(road.startAge)}
        r="8.5"
        fill={layout.dot}
        stroke={layout.dotStroke}
        strokeWidth="3"
      />
      {milestones.map((milestone, index) => {
        // a dot on the road, a dashed stem, a badge and (optionally) its label
        const mx = x(milestone.age).toFixed(1)
        const { roadY, badgeY, labelY } = milestone
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
            {labels ? (
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
      <text x={startX - 8} y={height - 12} {...ROAD_TEXT} fontSize="13" fill={labelColor}>
        {road.startLabel}
      </text>
      <text
        x={layout.endLabelX}
        y={height - 12}
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
