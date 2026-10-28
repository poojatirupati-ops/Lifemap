import AppHead from '../components/frame/AppHead.tsx'
import { PLAN_BUILDER_STEPS } from '../components/frame/planBuilderSteps.ts'
import { rerender } from '../state/shell.ts'
import { useStore } from '../state/store.ts'

export const key = 'PLAN0'
export const id = 'PLAN-0'
export const note =
  'My Plan before a plan exists (§12): empty state + "Make my plan", which starts the 8-step plan builder.'

const PLAN_BUILDER_SCREEN = /^(B1|F1|F2|F4|B4|P1|P1E|P1S|P1K|P2|P3|PU|P4)$/
const SECURE_STEP = 5

/** What each plan builder step is about, in step order. */
const STEP_DETAILS = [
  { icon: '🙂', detail: 'Name, age, partner and family' },
  { icon: '🎯', detail: 'Pick what matters to you' },
  { icon: '🗓️', detail: 'Drag goals to when you want them' },
  { icon: '🧭', detail: 'A few questions about risk' },
  { icon: '🔐', detail: 'A quick email and mobile check' },
  { icon: '💶', detail: 'Income, savings, home and pension' },
  { icon: '✅', detail: 'A short review before results' },
  { icon: '📈', detail: 'See what is on track and what to do next' },
]

// TODO(R-24): becomes a named store action (makePlan) once the store has per-context slices.
/** Opens the plan builder on My Plan, where the customer left off or at step 1. */
export function startPlan() {
  const { update, closeSheet, go, screen } = useStore.getState()
  update((plan) => {
    plan.tab = 'plan'
    plan.pb = true
  })
  closeSheet()
  if (!PLAN_BUILDER_SCREEN.test(screen)) go('B1')
  rerender()
}

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
        <button className="btn mk-go" data-a="makeplan" onClick={startPlan}>
          Start my plan <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="card wyd">
        <div className="wyd-h">
          <b>What you'll do</b>
          <span>8 steps · about 10 min</span>
        </div>
        <ol className="wsteps">
          {PLAN_BUILDER_STEPS.map((step, index) => (
            <li key={step.label} className="">
              <span className="ws-ic" aria-hidden="true">
                {STEP_DETAILS[index].icon}
              </span>
              <span className="ws-m">
                <b>
                  {index + 1}. {step.label}
                  {index + 1 === SECURE_STEP && (
                    <>
                      {' '}
                      <em>If needed</em>
                    </>
                  )}
                </b>
                <small>{STEP_DETAILS[index].detail}</small>
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
