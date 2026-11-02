// The road from today to the plan's end: coloured stretches on a gentle S-wave, milestones on stems.
import type { ReportData } from '../../report/model/reportData.ts'
import RoadMilestone from './RoadMilestone.tsx'
import { placeMilestones, ROAD_TEXT, waveHeight } from './road.ts'
import { COLOURS, fillOf } from './tones.ts'

type RoadData = ReportData['road']

export interface RoadLayout {
  width?: number
  height: number
  /** x of the start and end ages */
  startX: number
  endX: number
  /** y of the wave's middle, and how far the wave swings (1 = as drawn) */
  middleY: number
  swing?: number
  /** how far a milestone's badge sits from the road */
  stem: number
  endLabelX: number
  glow?: string
  stemColor?: string
  labelColor?: string
  subColor?: string
  endColor?: string
  labels?: boolean
}

export default function Road({ road, layout }: { road: RoadData; layout: RoadLayout }) {
  const { width = 794, height, startX, endX, middleY, swing = 1, stem } = layout
  const labelColor = layout.labelColor ?? '#fff'
  const subColor = layout.subColor ?? '#cdd8e8'
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
        stroke={layout.glow ?? 'rgba(255,255,255,.28)'}
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
      {placeMilestones(road.milestones, x).map((milestone, index) => (
        <RoadMilestone
          key={index}
          milestone={milestone}
          x={x(milestone.age)}
          roadY={y(milestone.age)}
          stem={stem}
          stemColor={layout.stemColor ?? 'rgba(255,255,255,.55)'}
          labelColor={labelColor}
          subColor={subColor}
          labels={layout.labels ?? true}
        />
      ))}
      <text x={startX - 8} y={height - 6} {...ROAD_TEXT} fontSize="13" fill={labelColor}>
        {road.startLabel}
      </text>
      <text
        x={layout.endLabelX}
        y={height - 6}
        textAnchor="end"
        {...ROAD_TEXT}
        fontSize="13"
        fill={layout.endColor ?? subColor}
      >
        {road.endLabel}
      </text>
    </svg>
  )
}
