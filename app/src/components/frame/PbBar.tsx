import { clsx } from 'clsx'
import { PLAN_BUILDER_STEPS } from '../../domain/journey/planBuilderSteps.ts'

/** The plan builder's progress ticks. Everyone signs in before the builder, so the account step is simply done. */
export default function PbBar({ current }: { current: number }) {
  return (
    <div
      className="pbbar"
      role="img"
      aria-label={`Plan builder, step ${current} of 8: ${PLAN_BUILDER_STEPS[current - 1].label}`}
    >
      {PLAN_BUILDER_STEPS.map(({ label }, index) => {
        const step = index + 1
        return <i key={label} className={clsx({ done: step < current, on: step === current })}></i>
      })}
    </div>
  )
}
