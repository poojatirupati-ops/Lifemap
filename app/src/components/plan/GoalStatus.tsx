import type { Goal } from '../../state/types.ts'
import { BAND_WORDS, band } from '../results/journey.ts'
import GoalLine from '../results/GoalLine.tsx'
import WhyNote from '../results/WhyNote.tsx'
import { changeGoalDate } from '../define/goalActions.ts'
import { isPassed, useTiming, yearsAway } from '../timeline/goalText.ts'
import { assumption, isChosen } from '../../domain/planning/assumptions.ts'
import GIcon from '../ui/GIcon.tsx'
import type { useProjection } from './useProjection.ts'

const BAND_EMOJI = { good: '☀️', nudge: '🌦️', alert: '⛈️' }

type Props = ReturnType<typeof useProjection> & { goal: Goal }

/** One goal in Your goals: when, a covered bar, how it is funded and its band. */
export default function GoalStatus({ goal, plan, whatIf, withWhatIf }: Props) {
  const timing = useTiming()
  const covered = withWhatIf.percent[goal.id]
  const tone = band(covered)
  const passed = isPassed(timing, goal)
  const years = yearsAway(timing, goal)
  const when = passed
    ? 'Date has passed'
    : goal.kind === 'legacy'
      ? 'at the end of your plan' +
        (isChosen(timing.asm, 'planEnd') ? ` (${assumption(timing, 'planEnd')})` : '')
      : goal.kind === 'retire'
        ? timing.retireSet
          ? `at ${goal.age}`
          : "at an age you haven't chosen yet"
        : `in ${years} year${years === 1 ? '' : 's'}`

  return (
    <div className="gs">
      <GIcon emoji={goal.e} className="e" aria-hidden="true" />
      <div className="m">
        <div className="nm">
          {goal.name} <span>· {when}</span>
          {passed && (
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
          )}
        </div>
        <div className="bar" role="img" aria-label={`${covered}% covered`}>
          <i style={{ width: `${covered}%`, background: `var(--${tone})` }}></i>
        </div>
        <GoalLine plan={plan} projection={withWhatIf} whatIf={whatIf} goal={goal} />
        <WhyNote plan={plan} projection={withWhatIf} goal={goal} />
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
