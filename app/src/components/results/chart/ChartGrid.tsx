import { Fragment } from 'react'
import { axisLabel, PAD_LEFT, PAD_RIGHT } from './cashflow.ts'

const GRID_STEPS = [1, 2, 3]

interface Props {
  width: number
  max: number
  y: (amount: number) => number
}

/** Three labelled grid lines at thirds of the axis, and the baseline. */
export default function ChartGrid({ width, max, y }: Props) {
  const right = width - PAD_RIGHT
  const baseline = y(0)
  return (
    <>
      {GRID_STEPS.map((step) => {
        const amount = (max * step) / 3
        const at = y(amount)
        return (
          <Fragment key={step}>
            <line
              x1={PAD_LEFT}
              x2={right}
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
      <line x1={PAD_LEFT} x2={right} y1={baseline} y2={baseline} stroke="#B9C9D6" strokeWidth="1" />
    </>
  )
}
