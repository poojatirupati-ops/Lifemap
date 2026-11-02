import { PLAN_BUILDER_STEPS, planBuilderStep } from '../../domain/journey/planBuilderSteps.ts'
import { makePlan } from '../me/meActions.ts'
import { useStore } from '../../state/store.ts'

/** The card under Home's hero: start the plan builder, or carry on where the customer left it. */
export default function PlanCard() {
  const step = useStore((store) => (store.planBuilder ? planBuilderStep(store.screen) : 0))
  const card = step
    ? {
        title: 'Carry on with your plan',
        due: `Step ${step} of ${PLAN_BUILDER_STEPS.length} · ${PLAN_BUILDER_STEPS[step - 1].label.toLowerCase()}`,
        foot: 'Everything so far is saved.',
        cta: 'Carry on',
      }
    : {
        title: 'Make my plan',
        due: `About 10 minutes · ${PLAN_BUILDER_STEPS.length} short steps`,
        foot: 'Goals, timeline and money in one plan.',
        cta: 'Start',
      }

  return (
    <div className="card h0plan">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <b className="h0pt">{card.title}</b>
          <div className="small h0due">
            <span aria-hidden="true">🕒</span> {card.due}
          </div>
        </div>
        <span className="h0art" aria-hidden="true">
          🗺️
        </span>
      </div>
      <div className="h0foot">
        <span className="small">{card.foot}</span>
        <button className="btn sm" data-a="makeplan" onClick={makePlan}>
          {card.cta}
        </button>
      </div>
    </div>
  )
}
