import AppScreen from '../frame/AppScreen.tsx'
import { PLAN_BUILDER_STEPS } from '../../domain/journey/planBuilderSteps.ts'
import { makePlan } from '../../state/plan.ts'

/** My Plan before a plan exists (PLAN-0). */
export default function PlanEmpty() {
  return (
    <AppScreen
      id="PLAN-0"
      note='My Plan before a plan exists (§12): empty state + "Make my plan", which starts the 8-step plan builder.'
      title="My Plan"
      sub="Your plan will live here."
    >
      <div className="card mkplan mk2">
        <div className="mk-chips">
          <span>⏱ About 10 min</span>
          <span>☁️ Saves as you go</span>
        </div>
        <b className="mk-t">Make my plan</b>
        <p className="mk-d">Your goals, timeline and money in one clear plan.</p>
        <button className="btn mk-go" data-a="makeplan" onClick={makePlan}>
          Start my plan <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="card wyd">
        <div className="wyd-h">
          <b>What you'll do</b>
          <span>{PLAN_BUILDER_STEPS.length} steps · about 10 min</span>
        </div>
        <ol className="wsteps">
          {PLAN_BUILDER_STEPS.map((step, index) => (
            <li key={step.label}>
              <span className="ws-ic" aria-hidden="true">
                {step.icon}
              </span>
              <span className="ws-m">
                <b>
                  {index + 1}. {step.label}
                  {step.optional ? [' ', <em key="optional">If needed</em>] : null}
                </b>
                <small>{step.detail}</small>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <p className="disc">
        Guidance, not advice. Nothing is shared with an adviser unless you choose.
      </p>
    </AppScreen>
  )
}
