import type { YearRow } from '../../../domain/planning/project.ts'
import type { Goal } from '../../../state/types.ts'
import {
  axisLabel,
  axisMax,
  chartLabel,
  PAD_LEFT,
  PAD_RIGHT,
  stackMarkers,
  yearSplit,
} from './cashflow.ts'

const HEIGHT = 250
const BOTTOM = 20
const GRID_STEPS = [1, 2, 3]

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
  const baseline = y(0)
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
      {GRID_STEPS.map((step) => {
        const at = y((max * step) / 3)
        return [
          <line
            key={`l${step}`}
            x1={PAD_LEFT}
            x2={width - PAD_RIGHT}
            y1={at.toFixed(1)}
            y2={at.toFixed(1)}
            stroke="#E3EAF0"
            strokeWidth="1"
          />,
          <text
            key={`t${step}`}
            x={PAD_LEFT - 4}
            y={(at + 3.5).toFixed(1)}
            fontSize="9.5"
            fill="#51627A"
            textAnchor="end"
          >
            {axisLabel((max * step) / 3)}
          </text>,
        ]
      })}
      <line
        x1={PAD_LEFT}
        x2={width - PAD_RIGHT}
        y1={baseline}
        y2={baseline}
        stroke="#B9C9D6"
        strokeWidth="1"
      />

      {rows.map((row, i) => {
        const split = splits[i]
        let below = 0
        return [
          ...[
            { amount: split.fromIncome, fill: 'var(--good)' },
            { amount: split.fromSavings, fill: 'var(--nudge)', stroke: 'var(--nudge-edge)' },
            { amount: split.shortfall, fill: 'var(--alert)' },
          ]
            .filter(({ amount }) => amount > 0.5)
            .map(({ amount, fill, stroke }) => {
              below += amount
              return (
                <rect
                  key={`${row.age}${fill}`}
                  x={left(i).toFixed(1)}
                  y={y(below).toFixed(2)}
                  width={barWidth.toFixed(1)}
                  height={(baseline - y(amount)).toFixed(2)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={stroke ? '0.6' : undefined}
                />
              )
            }),
          i === selected ? (
            <rect
              key={`${row.age}sel`}
              x={(left(i) - 1.5).toFixed(1)}
              y={(y(split.spending) - 2).toFixed(1)}
              width={(barWidth + 3).toFixed(1)}
              height={(baseline - y(split.spending) + 4).toFixed(1)}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.6"
              rx="1.5"
            />
          ) : null,
          row.age % 10 === 0 ? (
            <text
              key={`${row.age}age`}
              x={centre(i).toFixed(1)}
              y={HEIGHT - 6}
              fontSize="10"
              fill="#51627A"
              textAnchor="middle"
            >
              {row.age}
            </text>
          ) : null,
        ]
      })}

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

      {rows.map((row, i) => {
        const x = centre(i)
        return [
          row.age === retiringAge ? (
            <path key={row.age} d={`M${(x - 5).toFixed(1)} 2 h10 l-5 8 z`} fill="var(--ink)">
              <title>{`Retirement starts, age ${row.age}`}</title>
            </path>
          ) : null,
          row.age === statePensionAge && [
            <line
              key={`${row.age}sp`}
              x1={x.toFixed(1)}
              x2={x.toFixed(1)}
              y1={baseline}
              y2={baseline + 5}
              stroke="var(--ink)"
              strokeWidth="1.6"
            />,
            <text
              key={`${row.age}spt`}
              x={(x - 2).toFixed(1)}
              y={baseline + 12}
              fontSize="8.5"
              fill="var(--ink)"
              fontWeight="700"
              textAnchor="end"
            >
              SP<title>{`State Pension starts, age ${row.age}`}</title>
            </text>,
          ],
        ]
      })}
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
