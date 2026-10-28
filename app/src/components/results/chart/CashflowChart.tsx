import { Fragment } from 'react'
import type { YearRow } from '../../../domain/planning/project.ts'
import type { Goal } from '../../../state/types.ts'
import YearBar from './YearBar.tsx'
import YearMarks from './YearMarks.tsx'
import { axisLabel, axisMax, isShortYear, stackMarkers, yearSplit } from './cashflow.ts'

const PAD_LEFT = 34
const PAD_RIGHT = 6
const BOTTOM = 20
const GRID_LINES = [1, 2, 3]

interface Props {
  rows: YearRow[]
  width: number
  landscape: boolean
  selected: number
  onSelect: (index: number) => void
  showSavings: boolean
  goals: Goal[]
  hasRetirement: boolean
  statePensionAge: number
}

/** One bar per year: spending paid from income, from savings and not covered, under the income line. */
export default function CashflowChart(props: Props) {
  const { rows, width, selected, onSelect, showSavings, hasRetirement, statePensionAge } = props
  const height = props.landscape || width <= 500 ? 250 : 290
  const barStep = (width - PAD_LEFT - PAD_RIGHT) / rows.length
  const barWidth = Math.max(1, barStep - (barStep > 4 ? 1.2 : 0.4))
  const left = (index: number) => PAD_LEFT + index * barStep
  const centre = (index: number) => left(index) + barStep / 2

  const markedGoals = props.goals.filter((goal) => goal.kind !== 'retire' && goal.kind !== 'legacy')
  const markers = stackMarkers(markedGoals, rows, centre)
  const levels = Math.max(1, ...markers.map((marker) => marker.level + 1))
  const top = 14 + levels * 14 + (hasRetirement ? 4 : 0)

  const splits = rows.map(yearSplit)
  const max = axisMax(
    Math.max(
      1,
      ...splits.map((split) => split.spending),
      ...rows.map((row) => row.inflow),
      ...(showSavings ? rows.map((row) => row.liquid) : []),
    ),
  )
  const plotHeight = height - top - BOTTOM
  const y = (amount: number) => height - BOTTOM - (amount / max) * plotHeight
  const baseline = y(0)
  const line = (value: (row: YearRow) => number) =>
    rows
      .map((row, i) => `${i ? 'L' : 'M'}${centre(i).toFixed(1)} ${y(value(row)).toFixed(1)} `)
      .join('')

  const firstShort = rows.find(isShortYear)
  const label =
    `Yearly cashflow, age ${rows[0].age} to ${rows[rows.length - 1].age}. ` +
    (firstShort ? `Shortfall from age ${firstShort.age}.` : 'Every year is covered.')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={label}
      style={{ display: 'block', marginTop: 8 }}
      className="cchart"
    >
      {GRID_LINES.map((step) => {
        const amount = (max * step) / 3
        const at = y(amount)
        return (
          <Fragment key={step}>
            <line
              x1={PAD_LEFT}
              x2={width - PAD_RIGHT}
              y1={at.toFixed(1)}
              y2={at.toFixed(1)}
              stroke="#E3EAF0"
              strokeWidth="1"
            />
            <text
              x={PAD_LEFT - 4}
              y={(at + 3.5).toFixed(1)}
              fontSize="9.5"
              fill="#51627A"
              textAnchor="end"
            >
              {axisLabel(amount)}
            </text>
          </Fragment>
        )
      })}
      <line
        x1={PAD_LEFT}
        x2={width - PAD_RIGHT}
        y1={baseline}
        y2={baseline}
        stroke="#B9C9D6"
        strokeWidth="1"
      />

      {rows.map((row, i) => (
        <YearBar
          key={row.age}
          split={splits[i]}
          age={row.age}
          left={left(i)}
          width={barWidth}
          centre={centre(i)}
          y={y}
          heightOf={(amount) => (amount / max) * plotHeight}
          selected={i === selected}
          labelY={height - 6}
        />
      ))}

      {showSavings && (
        <path
          d={line((row) => Math.max(0, row.liquid))}
          fill="none"
          stroke="#6E8AA6"
          strokeWidth="1.4"
          opacity=".8"
        />
      )}
      <path
        d={line((row) => row.inflow)}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.8"
        strokeDasharray="5 3"
      />

      {rows.map((row, i) => (
        <YearMarks
          key={row.age}
          age={row.age}
          centre={centre(i)}
          baseline={baseline}
          retiring={row.retiresThisYear && hasRetirement}
          statePension={row.age === statePensionAge}
        />
      ))}
      {markers.map(({ goal, x, level }) => (
        <text
          key={goal.id}
          x={x.toFixed(1)}
          y={top - 4 - level * 14}
          fontSize="12"
          textAnchor="middle"
        >
          {goal.e}
          <title>{`${goal.name}, age ${goal.age}`}</title>
        </text>
      ))}

      {rows.map((row, i) => (
        <rect
          key={row.age}
          x={left(i).toFixed(1)}
          y={top}
          width={barStep.toFixed(2)}
          height={height - BOTTOM - top}
          fill="transparent"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect(i)}
        >
          <title>{`Age ${row.age}`}</title>
        </rect>
      ))}
    </svg>
  )
}
