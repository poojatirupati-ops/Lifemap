import { useMemo } from 'react'
import { isPassed, yearsAway, type TimingInputs } from '../../domain/goals/goalTiming.ts'
import { assumption, isChosen } from '../../domain/planning/assumptions.ts'
import { BAND_WORDS, band } from '../../domain/planning/bands.ts'
import { fundingOrder } from '../../domain/planning/fund.ts'
import { extraToFullyFund, goalLineText } from '../../domain/planning/goalLine.ts'
import { planSettings, type ProjectionInputs } from '../../domain/planning/planSettings.ts'
import { savingLine } from '../../domain/planning/saving.ts'
import { whyNoteText } from '../../domain/planning/whyNote.ts'
import type { WhatIf } from '../../domain/planning/wi.ts'
import type { Projection } from '../../hooks/useProjection.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import type { Goal } from '../../state/types.ts'
import { changeGoalDate } from '../../state/goals.ts'
import GIcon from '../ui/GIcon.tsx'

const BAND_EMOJI = { good: '☀️', nudge: '🌦️', alert: '⛈️' }

type HomeFigures = ReturnType<typeof planSettings>['figures']

interface Props {
  inputs: ProjectionInputs
  whatIf: WhatIf
  /** the plan with the what-if applied */
  projection: Projection
}

/** When a goal happens, as Your goals says it. */
function goalWhen(goal: Goal, timing: TimingInputs) {
  if (isPassed(timing, goal)) return 'Date has passed'
  if (goal.kind === 'legacy') {
    const planEnd = isChosen(timing.assumptions, 'planEnd')
      ? ` (${assumption(timing, 'planEnd')})`
      : ''
    return `at the end of your plan${planEnd}`
  }
  if (goal.kind === 'retire')
    return timing.retireSet ? `at ${goal.age}` : "at an age you haven't chosen yet"
  const years = yearsAway(timing, goal)
  return `in ${years} year${years === 1 ? '' : 's'}`
}

/** How a goal is funded: fully, or what it needs a month against what it gets on average. */
export function GoalLine(props: {
  plan: ProjectionInputs
  whatIf: WhatIf
  projection: Projection
  goal: Goal
}) {
  const { plan, projection, whatIf, goal } = props
  const funding = projection.goals[goal.id]
  const covered = projection.percent[goal.id]
  const extra = useMemo(
    () => (funding && covered < 100 ? extraToFullyFund(plan, goal, whatIf) : null),
    [plan, goal, whatIf, funding, covered],
  )
  if (!funding) return null
  const text = goalLineText({
    goal,
    home: plan.figures.home,
    covered,
    averageMonthly: funding.averageMonthly,
    neededMonthly: funding.neededMonthly,
    spareMonthly: projection.saving.spareMonthly,
    extra,
  })
  return <div className="gl">{text}</div>
}

/** Where a goal's money comes from, and what is still to find. */
export function WhyNote(props: { figures: HomeFigures; projection: Projection; goal: Goal }) {
  const { figures, projection, goal } = props
  const funding = projection.goals[goal.id]
  if (!funding || goal.kind === 'retire' || goal.kind === 'legacy') return null
  const text = whyNoteText({
    funding,
    covered: projection.percent[goal.id],
    goalKind: goal.kind,
    homeValue: figures.homeValue,
    homeUse: figures.homeUse,
  })
  if (!text) return null
  return (
    <div className="gl" style={{ opacity: 0.85 }}>
      {text}
    </div>
  )
}

/** Your goals: how much of each your income and savings cover, in funding order once ranked. */
export default function GoalsCard({ inputs, whatIf, projection }: Props) {
  const timing = useTiming()
  const figures = useMemo(() => planSettings(inputs).figures, [inputs])
  const { goals, rank } = inputs
  const ordered = rank ? fundingOrder(goals, rank) : goals.toSorted((a, b) => a.age - b.age)
  const { spareMonthly, savingMonthly } = projection.saving
  const line = savingLine(spareMonthly, savingMonthly)

  return (
    <div className="card">
      <h3 className="h">Your goals</h3>
      <p className="small" style={{ margin: '0 0 6px' }}>
        How much of each goal your future income and savings can cover.
      </p>
      <div id="r-goals">
        {line ? (
          <p className="small" style={{ margin: '0 0 10px' }}>
            {line}
          </p>
        ) : null}
        {ordered.map((goal) => {
          const covered = projection.percent[goal.id]
          const tone = band(covered)
          return (
            <div className="gs" key={goal.id}>
              <GIcon emoji={goal.emoji} className="e" aria-hidden="true" />
              <div className="m">
                <div className="nm">
                  {goal.name} <span>· {goalWhen(goal, timing)}</span>
                  {isPassed(timing, goal) ? (
                    <>
                      {' '}
                      <button
                        className="link"
                        style={{ fontSize: 12.5 }}
                        data-a="gdate"
                        data-p={goal.id}
                        onClick={() => changeGoalDate(goal.id)}
                      >
                        Change the date
                      </button>
                    </>
                  ) : null}
                </div>
                <div className="bar" role="img" aria-label={`${covered}% covered`}>
                  <i style={{ width: `${covered}%`, background: `var(--${tone})` }}></i>
                </div>
                <GoalLine plan={inputs} projection={projection} whatIf={whatIf} goal={goal} />
                <WhyNote figures={figures} projection={projection} goal={goal} />
              </div>
              <div className="p" style={{ color: `var(--${tone}-t)` }}>
                {covered}%
                <small>
                  <span aria-hidden="true">{BAND_EMOJI[tone]}</span> {BAND_WORDS[tone]}
                </small>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
