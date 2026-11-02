import { goalWhen, hasPassed } from '../../domain/goals/when.ts'
import { euro } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import type { Goal } from '../../state/types.ts'
import GIcon from '../ui/GIcon.tsx'
import { changeGoalDate } from './goalActions.ts'

/** One goal in the recap; a goal whose date has passed offers "Change the date". */
export default function GoalRecapRow({ goal }: { goal: Goal }) {
  const when = useStore((store) => goalWhen(goal, store.plan))
  const passed = useStore((store) => hasPassed(goal, store.plan.about.age))

  return (
    <li>
      <GIcon emoji={goal.emoji} className="lmt-e" aria-hidden="true" />
      <span className="lmt-m">
        <b>{goal.name}</b>
        <small>{when}</small>
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
      </span>
      <span className="lmt-v">
        {euro(goal.amount)}
        {goal.kind === 'retire' ? <small>a year</small> : null}
      </span>
    </li>
  )
}
