import { clsx } from 'clsx'
import { useStore } from '../../state/store.ts'
import { PLAN_BUILDER_STEPS, planBuilderStep } from '../../domain/journey/planBuilderSteps.ts'

/** The plan builder's progress ticks; the optional step shows as skipped once the account is verified. */
export default function PbBar() {
  const current = useStore((s) => planBuilderStep(s.screen))
  const verified = useStore((s) => s.plan.account.emailVerified)

  return (
    <div
      className="pbbar"
      role="img"
      aria-label={`Plan builder, step ${current} of 8: ${PLAN_BUILDER_STEPS[current - 1].label}`}
    >
      {PLAN_BUILDER_STEPS.map(({ label, optional }, index) => {
        const step = index + 1
        const skip = optional && verified && step !== current
        return (
          <i key={label} className={clsx({ done: step < current, on: step === current, skip })}></i>
        )
      })}
    </div>
  )
}
