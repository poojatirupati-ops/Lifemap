import { euroShort } from '../../lib/format.ts'
import type { Goal } from '../../state/types.ts'
import { band } from '../results/journey.ts'
import { calendarYear, isPassed, type TimingInputs } from '../timeline/goalText.ts'
import { changeGoalDate } from './homeActions.ts'

/** Each goal's photo: one of the built-in pictures. */
const PHOTO: Record<string, string> = {
  home: 'art-mortgage',
  mfree: 'art-mortgage',
  retire: 'art-pension',
  legacy: 'art-pension',
  wealth: 'art-investing',
  edu: 'art-edu',
  business: 'art-investing',
  safety: 'art-rain',
  family: 'art-family',
  helpfam: 'art-protection',
  wedding: 'art-wedding',
  travel: 'art-travel',
  car: 'art-car',
  health: 'art-protection',
}

const tagText = (percent: number) =>
  percent >= 95 ? 'On track' : percent >= 60 ? 'Nearly there' : 'Needs attention'

type Props = { goal: Goal; percent: number; timing: TimingInputs }

/** A goal as a photo card: status tag, name, target, when and covered percent. */
export default function GoalCard({ goal, percent, timing }: Props) {
  const passed = isPassed(timing, goal)
  const retire = goal.kind === 'retire'
  const target = goal.amount ? euroShort(goal.amount) + (retire ? '/yr' : '') : '–'
  const when = retire ? `Age ${goal.age}` : passed ? 'Passed' : calendarYear(timing, goal.age)

  return (
    <div className="hcard">
      <div
        className="hc-img"
        style={{ backgroundImage: `var(--${PHOTO[goal.k] ?? 'art-everyday'})` }}
      >
        <span className="hc-tag" style={{ color: `var(--${band(percent)}-t)` }}>
          {tagText(percent)}
        </span>
        <span className="hc-name">
          <span aria-hidden="true">{goal.e}</span> {goal.name}
        </span>
        <span className="hc-stats">
          <span>
            <small>Target</small>
            {target}
          </span>
          <span>
            <small>When</small>
            {when}
          </span>
          <span>
            <small>Covered</small>
            {`${percent}%`}
          </span>
        </span>
      </div>
      {passed && (
        <div className="hc-body">
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
        </div>
      )}
    </div>
  )
}
