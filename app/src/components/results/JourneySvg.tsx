import { Fragment, type CSSProperties } from 'react'
import type { YearRow } from '../../domain/planning/project'
import type { Goal } from '../../state/types'
import { BAND_WORDS, band, isShortYear, layoutJourney, yearBand } from './journey'

interface Props {
  rows: YearRow[]
  goals: Goal[]
  percent: Record<number, number>
  width: number
  landscape: boolean
  hasRetireGoal: boolean
}

const BOLD = { fontSize: 11, fontWeight: 800, fill: 'var(--ink)' }
const stroke = (width: number) => ({ strokeWidth: width, strokeLinecap: 'round' as const })
/** A point's two attributes, to one decimal. */
const at = (xName: string, yName: string, x: number, y: number) => ({
  [xName]: x.toFixed(1),
  [yName]: y.toFixed(1),
})

let canvas: CanvasRenderingContext2D | null = null
/** Width of a bold label in the font rendering now. */
function textWidth(text: string, px: number) {
  try {
    canvas ??= document.createElement('canvas').getContext('2d')
    canvas!.font = `700 ${px}px Figtree, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
    return canvas!.measureText(text).width * 1.06 + 4
  } catch {
    return text.length * px * 0.62 + 4
  }
}

/** Your life as one road to 90: coloured by year, with a ring for each goal. */
export default function JourneySvg({
  rows,
  goals,
  percent,
  width,
  landscape,
  hasRetireGoal,
}: Props) {
  const milestones = goals
    .filter((goal) => goal.kind !== 'retire')
    .sort((a, b) => a.age - b.age || a.id - b.id)
  const road = layoutJourney({
    ages: rows.map((row) => row.age),
    retireIndex: hasRetireGoal ? rows.findIndex((row) => row.retiresThisYear) : -1,
    milestones,
    width,
    landscape,
    textWidth,
  })
  const { wide, start, flag, sunset, points, R } = road
  const segments = points
    .slice(1)
    .map((end, i) => ({ start: points[i], end, band: yearBand(rows[i]) }))
  const line = (s: (typeof segments)[number]) => ({
    x1: s.start.x,
    y1: s.start.y,
    x2: s.end.x,
    y2: s.end.y,
  })
  const shortYear = rows.find(isShortYear)
  const ageLabelY = road.bottom - 6

  return (
    <>
      <svg
        viewBox={`0 ${road.top} ${width} ${road.bottom - road.top}`}
        width="100%"
        role="img"
        aria-label={`Road from age ${rows[0].age} to 90. ${shortYear ? 'Some coral shortfall years.' : 'No shortfall years.'}`}
        className={landscape ? 'road-land' : undefined}
        style={{ display: 'block', marginTop: 6 }}
      >
        {segments.map((s, i) => (
          <line key={i} {...line(s)} stroke="#DCE4EC" {...stroke(wide ? 16 : 13)} />
        ))}
        {segments.map((s, i) => (
          <Fragment key={i}>
            {s.band === 'nudge' && (
              <line {...line(s)} stroke="var(--nudge-edge)" {...stroke(wide ? 11 : 9)} />
            )}
            <line {...line(s)} stroke={`var(--${s.band})`} {...stroke(wide ? 9 : 7)} />
          </Fragment>
        ))}
        {road.placed.map((m) => (
          <Fragment key={m.milestone.id}>
            <line
              {...at('x1', 'y1', m.cx, m.cy)}
              {...at('x2', 'y2', m.x, m.y)}
              stroke="#9FB3C4"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <circle
              {...at('cx', 'cy', m.cx, m.cy)}
              r="3"
              fill="#fff"
              stroke="var(--ink)"
              strokeWidth="1.5"
            />
          </Fragment>
        ))}
        <circle cx={start.x} cy={start.y} r="6.5" fill="var(--ink)" stroke="#fff" strokeWidth="2" />
        {flag && (
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
        )}
        <text x={sunset.x} y={sunset.y} fontSize="18" aria-hidden="true">
          🌅
        </text>
        {road.placed.map(({ milestone: goal, x, y, labelX, labelY, name }) => {
          const p = percent[goal.id]
          return (
            <g key={goal.id}>
              <circle
                {...at('cx', 'cy', x, y)}
                r={R}
                fill="#fff"
                stroke={`var(--${band(p)})`}
                strokeWidth="3.5"
              />
              <text
                {...at('x', 'y', x, y + (wide ? 6 : 4.5))}
                fontSize={wide ? 16 : 12.5}
                textAnchor="middle"
              >
                {goal.e}
              </text>
              {wide && (
                <text
                  {...at('x', 'y', labelX, labelY)}
                  fontSize="11"
                  fontWeight="700"
                  fill="var(--ink)"
                  textAnchor="middle"
                >
                  {name}
                </text>
              )}
              <title>{`${goal.name}, age ${goal.age}: ${p}% covered, ${BAND_WORDS[band(p)].toLowerCase()}`}</title>
            </g>
          )
        })}
        <line
          x1={start.x}
          y1={start.y + 9}
          x2={start.x}
          y2={road.bottom - (wide ? 19 : 30)}
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
          <text x={start.x - 8} y={road.bottom - 18} {...BOLD}>
            You,
            <tspan x={start.x - 8} dy="12">
              today
            </tspan>
          </text>
        )}
        {road.decades.map(({ x, age }) => (
          <text key={age} x={x} y={ageLabelY} fontSize="10.5" fill="#51627A" textAnchor="middle">
            {`age ${age}`}
          </text>
        ))}
      </svg>
      {!wide && (
        <div className="mlist">
          {milestones.map((goal) => {
            const p = percent[goal.id]
            return (
              <div className="ml-r" key={goal.id}>
                <span
                  className="ml-e"
                  style={{ '--c': `var(--${band(p)})` } as CSSProperties}
                  aria-hidden="true"
                >
                  {goal.e}
                </span>
                <span className="ml-m">
                  <b>{goal.name}</b>
                  <small>{`Age ${goal.age}`}</small>
                </span>
                <span className={`ml-p ${band(p)}`}>
                  {`${p}%`}
                  <span className="sr">{` ${BAND_WORDS[band(p)]}`}</span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
