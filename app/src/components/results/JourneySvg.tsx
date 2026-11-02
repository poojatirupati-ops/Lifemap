import { Fragment } from 'react'
import type { YearRow } from '../../domain/planning/project'
import { textWidth } from '../../lib/textWidth'
import type { Goal } from '../../state/types'
import { BAND_WORDS, band, yearBand } from '../../domain/planning/bands'
import { layoutJourney } from './journey'

interface Props {
  rows: YearRow[]
  /** the non-retirement goals in age order */
  milestones: Goal[]
  percent: Record<number, number>
  width: number
  landscape: boolean
  hasRetireGoal: boolean
  hasShortYear: boolean
}

const BOLD = { fontSize: 11, fontWeight: 800, fill: 'var(--ink)' }
const oneDecimal = (value: number) => value.toFixed(1)

/** Your life as one road to 90: coloured by year, with a ring for each goal. */
export default function JourneySvg({
  rows,
  milestones,
  percent,
  width,
  landscape,
  hasRetireGoal,
  hasShortYear,
}: Props) {
  const road = layoutJourney({
    ages: rows.map((row) => row.age),
    retireIndex: hasRetireGoal ? rows.findIndex((row) => row.retiresThisYear) : -1,
    milestones,
    width,
    landscape,
    textWidth,
  })
  const { wide, start, flag, sunset, points, top, bottom, placed, ringRadius, decades } = road
  const segments = points.slice(1).map((end, i) => ({
    line: { x1: points[i].x, y1: points[i].y, x2: end.x, y2: end.y },
    tone: yearBand(rows[i]),
  }))
  const ageLabelY = bottom - 6

  return (
    <svg
      viewBox={`0 ${top} ${width} ${bottom - top}`}
      width="100%"
      role="img"
      aria-label={`Road from age ${rows[0].age} to 90. ${hasShortYear ? 'Some coral shortfall years.' : 'No shortfall years.'}`}
      className={landscape ? 'road-land' : undefined}
      style={{ display: 'block', marginTop: 6 }}
    >
      {segments.map(({ line }, i) => (
        <line
          key={i}
          {...line}
          stroke="#DCE4EC"
          strokeWidth={wide ? 16 : 13}
          strokeLinecap="round"
        />
      ))}
      {segments.map(({ line, tone }, i) => (
        <Fragment key={i}>
          {tone === 'nudge' ? (
            <line
              {...line}
              stroke="var(--nudge-edge)"
              strokeWidth={wide ? 11 : 9}
              strokeLinecap="round"
            />
          ) : null}
          <line
            {...line}
            stroke={`var(--${tone})`}
            strokeWidth={wide ? 9 : 7}
            strokeLinecap="round"
          />
        </Fragment>
      ))}
      {placed.map(({ milestone, anchorX, anchorY, x, y }) => (
        <Fragment key={milestone.id}>
          <line
            x1={oneDecimal(anchorX)}
            y1={oneDecimal(anchorY)}
            x2={oneDecimal(x)}
            y2={oneDecimal(y)}
            stroke="#9FB3C4"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <circle
            cx={oneDecimal(anchorX)}
            cy={oneDecimal(anchorY)}
            r="3"
            fill="#fff"
            stroke="var(--ink)"
            strokeWidth="1.5"
          />
        </Fragment>
      ))}
      <circle cx={start.x} cy={start.y} r="6.5" fill="var(--ink)" stroke="#fff" strokeWidth="2" />
      {flag ? (
        <>
          <line
            x1={flag.x}
            y1={flag.y}
            x2={flag.x}
            y2={flag.y - 44}
            stroke="var(--ink)"
            strokeWidth="2.5"
          />
          <path d={`M${flag.x} ${flag.y - 44} l24 7 l-24 7 z`} fill="#E4518A" />
          <text
            x={flag.x + (flag.flipped ? -6 : 4)}
            y={flag.y - 50}
            {...BOLD}
            textAnchor={flag.flipped ? 'end' : 'start'}
          >
            {flag.label}
          </text>
        </>
      ) : null}
      <text x={sunset.x} y={sunset.y} fontSize="18" aria-hidden="true">
        🌅
      </text>
      {placed.map(({ milestone: goal, x, y, labelX, labelY, name }) => {
        const tone = band(percent[goal.id])
        return (
          <g key={goal.id}>
            <circle
              cx={oneDecimal(x)}
              cy={oneDecimal(y)}
              r={ringRadius}
              fill="#fff"
              stroke={`var(--${tone})`}
              strokeWidth="3.5"
            />
            <text
              x={oneDecimal(x)}
              y={oneDecimal(y + (wide ? 6 : 4.5))}
              fontSize={wide ? 16 : 12.5}
              textAnchor="middle"
            >
              {goal.emoji}
            </text>
            {wide ? (
              <text
                x={oneDecimal(labelX)}
                y={oneDecimal(labelY)}
                fontSize="11"
                fontWeight="700"
                fill="var(--ink)"
                textAnchor="middle"
              >
                {name}
              </text>
            ) : null}
            <title>{`${goal.name}, age ${goal.age}: ${percent[goal.id]}% covered, ${BAND_WORDS[tone].toLowerCase()}`}</title>
          </g>
        )
      })}
      <line
        x1={start.x}
        y1={start.y + 9}
        x2={start.x}
        y2={bottom - (wide ? 19 : 30)}
        stroke="var(--ink)"
        strokeWidth="1.5"
        strokeDasharray="1 3"
        strokeLinecap="round"
      />
      {wide ? (
        <text x={start.x - 8} y={ageLabelY} {...BOLD}>
          You, today
        </text>
      ) : (
        <text x={start.x - 8} y={bottom - 18} {...BOLD}>
          You,
          <tspan x={start.x - 8} dy="12">
            today
          </tspan>
        </text>
      )}
      {decades.map(({ x, age }) => (
        <text key={age} x={x} y={ageLabelY} fontSize="10.5" fill="#51627A" textAnchor="middle">
          {`age ${age}`}
        </text>
      ))}
    </svg>
  )
}
