import { isPassed, yearsAway, type TimingInputs } from '../../domain/goals/goalTiming.ts'
import { assumption, isChosen } from '../../domain/planning/assumptions.ts'
import type { ProjectionInputs } from '../../domain/planning/planSettings.ts'
import type { WhatIf } from '../../domain/planning/wi.ts'
import type { Projection } from '../../hooks/useProjection.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import type { Goal } from '../../state/types.ts'
import { changeGoalDate } from '../define/goalActions.ts'
import GoalLine from '../results/GoalLine.tsx'
import { BAND_WORDS, band } from '../results/journey.ts'
import WhyNote from '../results/WhyNote.tsx'
import GIcon from '../ui/GIcon.tsx'

const BAND_EMOJI = { good: '☀️', nudge: '🌦️', alert: '⛈️' }

/** When a goal happens, as Your goals says it. */
function goalWhen(goal: Goal, timing: TimingInputs) {
  if (isPassed(timing, goal)) return 'Date has passed'
  if (goal.kind === 'legacy') {
    const planEnd = isChosen(timing.assumptions, 'planEnd') ? ` (${assumption(timing, 'planEnd')})` : ''
    return `at the end of your plan${planEnd}`
  }
  if (goal.kind === 'retire')
    return timing.retireSet ? `at ${goal.age}` : "at an age you haven't chosen yet"
  const years = yearsAway(timing, goal)
  return `in ${years} year${years === 1 ? '' : 's'}`
}

interface Props {
  goal: Goal
  inputs: ProjectionInputs
  whatIf: WhatIf
  /** the plan with the what-if applied */
  projection: Projection
}

/** One goal in Your goals: when, a covered bar, how it is funded and its band. */
export default function GoalStatus({ goal, inputs, whatIf, projection }: Props) {
  const timing = useTiming()
  const covered = projection.percent[goal.id]
  const tone = band(covered)
  const passed = isPassed(timing, goal)

  return (
    <div className="gs">
      <GIcon emoji={goal.emoji} className="e" aria-hidden="true" />
      <div className="m">
        <div className="nm">
          {goal.name} <span>· {goalWhen(goal, timing)}</span>
          {passed ? (
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
        <WhyNote plan={inputs} projection={projection} goal={goal} />
      </div>
      <div className="p" style={{ color: `var(--${tone}-t)` }}>
        {covered}%
        <small>
          <span aria-hidden="true">{BAND_EMOJI[tone]}</span> {BAND_WORDS[tone]}
        </small>
      </div>
    </div>
  )
}
