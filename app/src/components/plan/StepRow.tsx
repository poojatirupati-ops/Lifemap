import type { ReactNode } from 'react'
import { STEP } from '../../domain/planning/saving.ts'

interface Props {
  /** data-a of the −/+ buttons */
  action: string
  lessLabel: string
  moreLabel: string
  onStep: (change: number) => void
  /** the amount box between the buttons */
  children: ReactNode
}

/** An amount between − and + buttons that move it by €25. */
export default function StepRow({ action, lessLabel, moreLabel, onStep, children }: Props) {
  return (
    <div className="wi-row">
      <button
        className="rb"
        data-a={action}
        data-p={-STEP}
        aria-label={lessLabel}
        onClick={() => onStep(-STEP)}
      >
        −
      </button>
      <div className="wi-val">{children}</div>
      <button
        className="rb"
        data-a={action}
        data-p={STEP}
        aria-label={moreLabel}
        onClick={() => onStep(STEP)}
      >
        +
      </button>
    </div>
  )
}
