import { useStore } from '../../state/store.ts'
import { PLAN_BUILDER_STEPS, planBuilderStep } from './planBuilderSteps.ts'

const SECURE_STEP = 5

/** The plan builder's progress ticks. Hook-free so a screen's Head can call it. */
export default function PbBar() {
  const { plan, screen } = useStore.getState()
  const current = planBuilderStep(screen)
  const verified = plan.acct.ev

  const tickClass = (step: number) => {
    const progress = step < current ? 'done' : step === current ? 'on' : ''
    const skipped = step === SECURE_STEP && verified && current !== SECURE_STEP
    return progress + (skipped ? ' skip' : '')
  }

  return (
    <div
      className="pbbar"
      role="img"
      aria-label={`Plan builder, step ${current} of 8: ${PLAN_BUILDER_STEPS[current - 1].label}`}
    >
      {PLAN_BUILDER_STEPS.map((step, index) => (
        <i key={step.label} className={tickClass(index + 1)}></i>
      ))}
    </div>
  )
}
