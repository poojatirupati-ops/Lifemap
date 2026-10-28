import type { yearSplit } from './cashflow.ts'

interface Props {
  split: ReturnType<typeof yearSplit>
  age: number
  left: number
  width: number
  centre: number
  /** Pixels from the top for an amount, and the pixel height of an amount. */
  y: (amount: number) => number
  heightOf: (amount: number) => number
  selected: boolean
  labelY: number
}

/** One year's spending stacked up: income, then savings, then the shortfall; every tenth age labelled. */
export default function YearBar({
  split,
  age,
  left,
  width,
  centre,
  y,
  heightOf,
  selected,
  labelY,
}: Props) {
  let barTop = y(0)
  const segments = [
    { amount: split.fromIncome, fill: 'var(--good)' },
    { amount: split.fromSavings, fill: 'var(--nudge)', stroke: 'var(--nudge-edge)' },
    { amount: split.shortfall, fill: 'var(--alert)' },
  ].filter(({ amount }) => amount > 0.5)

  return (
    <>
      {segments.map(({ amount, fill, stroke }) => {
        const height = heightOf(amount)
        barTop -= height
        return (
          <rect
            key={fill}
            x={left.toFixed(1)}
            y={barTop.toFixed(2)}
            width={width.toFixed(1)}
            height={height.toFixed(2)}
            fill={fill}
            {...(stroke && { stroke, strokeWidth: '0.6' })}
          />
        )
      })}
      {selected && (
        <rect
          x={(left - 1.5).toFixed(1)}
          y={(y(Math.max(split.spending, 0)) - 2).toFixed(1)}
          width={(width + 3).toFixed(1)}
          height={(y(0) - y(split.spending) + 4).toFixed(1)}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.6"
          rx="1.5"
        />
      )}
      {age % 10 === 0 && (
        <text x={centre.toFixed(1)} y={labelY} fontSize="10" fill="#51627A" textAnchor="middle">
          {age}
        </text>
      )}
    </>
  )
}
