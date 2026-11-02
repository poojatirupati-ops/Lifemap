import type { YearSplit } from './cashflow.ts'

interface Props {
  split: YearSplit
  age: number
  left: number
  width: number
  centre: number
  /** Pixels from the top of the chart for an amount. */
  y: (amount: number) => number
  selected: boolean
  labelY: number
}

/** One year's spending stacked up: income, then savings, then the shortfall; every tenth age labelled. */
export default function YearBar({ split, age, left, width, centre, y, selected, labelY }: Props) {
  const segments = [
    { amount: split.fromIncome, fill: 'var(--good)' },
    { amount: split.fromSavings, fill: 'var(--nudge)', stroke: 'var(--nudge-edge)' },
    { amount: split.shortfall, fill: 'var(--alert)' },
  ].filter(({ amount }) => amount > 0.5)
  let below = 0
  const stacked = segments.map((segment) => {
    below += segment.amount
    return { ...segment, top: y(below), height: y(0) - y(segment.amount) }
  })

  return (
    <>
      {stacked.map(({ fill, stroke, top, height }) => (
        <rect
          key={fill}
          x={left.toFixed(1)}
          y={top.toFixed(2)}
          width={width.toFixed(1)}
          height={height.toFixed(2)}
          fill={fill}
          stroke={stroke}
          strokeWidth={stroke ? '0.6' : undefined}
        />
      ))}
      {selected ? (
        <rect
          x={(left - 1.5).toFixed(1)}
          y={(y(split.spending) - 2).toFixed(1)}
          width={(width + 3).toFixed(1)}
          height={(y(0) - y(split.spending) + 4).toFixed(1)}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.6"
          rx="1.5"
        />
      ) : null}
      {age % 10 === 0 ? (
        <text x={centre.toFixed(1)} y={labelY} fontSize="10" fill="#51627A" textAnchor="middle">
          {age}
        </text>
      ) : null}
    </>
  )
}
