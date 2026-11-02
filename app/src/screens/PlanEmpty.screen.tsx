import AppHead from '../components/frame/AppHead.tsx'
import { PLAN_BUILDER_STEPS } from '../domain/journey/planBuilderSteps.ts'
import { makePlan } from '../components/me/meActions.ts'

export const key = 'PLAN0'
export const id = 'PLAN-0'
export const note =
  'My Plan before a plan exists (§12): empty state + "Make my plan", which starts the 8-step plan builder.'

// AppHead is hook-free and called as a function so splitHead can pin its top bar.
export const Head = () => AppHead({ title: 'My Plan', sub: 'Your plan will live here.' })

export function Body() {
  return (
    <>
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
    </>
  )
}
