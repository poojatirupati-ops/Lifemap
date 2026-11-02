import type { YearRow } from '../../../domain/planning/project.ts'
import type { Goal } from '../../../state/types.ts'
import ChartGrid from './ChartGrid.tsx'
import YearBar from './YearBar.tsx'
import YearMarks from './YearMarks.tsx'
import { axisMax, chartLabel, PAD_LEFT, PAD_RIGHT, stackMarkers, yearSplit } from './cashflow.ts'

const HEIGHT = 250
const BOTTOM = 20

interface Props {
  rows: YearRow[]
  width: number
  selected: number
  onSelect: (index: number) => void
  showSavings: boolean
  /** Already filtered to the goals the chart marks. */
  goals: Goal[]
  retiringAge?: number
  statePensionAge: number
}

/** One bar per year: spending paid from income, from savings and not covered, under the income line. */
export default function CashflowChart(props: Props) {
  const { rows, width, selected, onSelect, showSavings, retiringAge, statePensionAge } = props
  const barStep = (width - PAD_LEFT - PAD_RIGHT) / rows.length
  const barWidth = Math.max(1, barStep - (barStep > 4 ? 1.2 : 0.4))
  const left = (index: number) => PAD_LEFT + index * barStep
  const centre = (index: number) => left(index) + barStep / 2

  const markers = stackMarkers(props.goals, rows, centre)
  const levels = Math.max(1, ...markers.map((marker) => marker.level + 1))
  const top = 14 + levels * 14 + (retiringAge == null ? 0 : 4)

  const splits = rows.map(yearSplit)
  const max = axisMax(
    Math.max(
      1,
      ...splits.map((split) => split.spending),
      ...rows.map((row) => row.inflow),
      ...(showSavings ? rows.map((row) => row.liquid) : []),
    ),
  )
  const plotHeight = HEIGHT - top - BOTTOM
  const y = (amount: number) => HEIGHT - BOTTOM - (amount / max) * plotHeight
  const line = (value: (row: YearRow) => number) =>
    rows
      .map((row, i) => `${i ? 'L' : 'M'}${centre(i).toFixed(1)} ${y(value(row)).toFixed(1)} `)
      .join('')

  return (
    <svg
      viewBox={`0 0 ${width} ${HEIGHT}`}
      width="100%"
      role="img"
      aria-label={chartLabel(rows)}
      style={{ display: 'block', marginTop: 8 }}
      className="cchart"
    >
      <ChartGrid width={width} max={max} y={y} />

      {rows.map((row, i) => (
        <YearBar
          key={row.age}
          split={splits[i]}
          age={row.age}
          left={left(i)}
          width={barWidth}
          centre={centre(i)}
          y={y}
          selected={i === selected}
          labelY={HEIGHT - 6}
        />
      ))}

      {showSavings ? (
        <path
          d={line((row) => Math.max(0, row.liquid))}
          fill="none"
          stroke="#6E8AA6"
          strokeWidth="1.4"
          opacity=".8"
        />
      ) : null}
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
          baseline={y(0)}
          retiring={row.age === retiringAge}
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
          {goal.emoji}
          <title>{`${goal.name}, age ${goal.age}`}</title>
        </text>
      ))}

      {rows.map((row, i) => (
        <rect
          key={row.age}
          x={left(i).toFixed(1)}
          y={top}
          width={barStep.toFixed(2)}
          height={HEIGHT - BOTTOM - top}
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
