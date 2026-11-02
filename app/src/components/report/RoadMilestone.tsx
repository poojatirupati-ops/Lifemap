// One milestone on the road: a dot on the road, a dashed stem, a badge and (optionally) its label.
import { COLOURS, fillOf } from './tones.ts'
import { ROAD_TEXT } from './road.ts'
import type { ReportData } from '../../report/model/reportData.ts'

interface RoadMilestoneProps {
  milestone: ReportData['road']['milestones'][number] & { above: boolean }
  x: number
  roadY: number
  stem: number
  stemColor: string
  labelColor: string
  subColor: string
  labels: boolean
}

export default function RoadMilestone(props: RoadMilestoneProps) {
  const { milestone, roadY, stem } = props
  const x = props.x.toFixed(1)
  const badgeY = milestone.above ? roadY - stem : roadY + stem
  const labelY = milestone.above ? badgeY - 38 : badgeY + 33
  const colour = fillOf(milestone.tone)
  return (
    <>
      <line
        x1={x}
        y1={milestone.above ? badgeY + 15 : badgeY - 15}
        x2={x}
        y2={roadY.toFixed(1)}
        stroke={props.stemColor}
        strokeWidth="1.2"
        strokeDasharray="2 3"
      />
      <circle cx={x} cy={roadY.toFixed(1)} r="5.2" fill="#fff" stroke={colour} strokeWidth="2.5" />
      <circle cx={x} cy={badgeY.toFixed(1)} r="15" fill="#fff" stroke={colour} strokeWidth="4" />
      <text
        x={x}
        y={(badgeY + 4.6).toFixed(1)}
        textAnchor="middle"
        {...ROAD_TEXT}
        fontSize="13"
        fill={COLOURS.navy}
      >
        {milestone.badge}
      </text>
      {props.labels ? (
        <>
          <text
            x={x}
            y={labelY}
            textAnchor="middle"
            {...ROAD_TEXT}
            fontSize="14"
            fill={props.labelColor}
          >
            {milestone.label}
          </text>
          <text
            x={x}
            y={labelY + 16}
            textAnchor="middle"
            fontFamily={ROAD_TEXT.fontFamily}
            fontSize="12"
            fill={props.subColor}
          >
            {milestone.sub}
          </text>
        </>
      ) : null}
    </>
  )
}
