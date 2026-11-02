import { useShallow } from 'zustand/react/shallow'
import { goalWhen, isPassed } from '../../domain/goals/goalTiming.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import { euro } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import { changeGoalDate } from '../../state/goals.ts'

/** Your goals, soonest first, each with when and how much; a passed date offers "Change the date". */
export default function GoalRecap() {
  const goals = useStore(useShallow(({ plan }) => plan.goals.toSorted((a, b) => a.age - b.age)))
  const timing = useTiming()

  return (
    <div className="card lmrec">
      <h3 className="h">Your goals</h3>
      <ol className="lmt">
        {goals.map((goal) => (
          <li key={goal.id}>
            <GIcon emoji={goal.emoji} className="lmt-e" aria-hidden="true" />
            <span className="lmt-m">
              <b>{goal.name}</b>
              <small>{goalWhen(timing, goal)}</small>
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
            </span>
            <span className="lmt-v">
              {euro(goal.amount)}
              {goal.kind === 'retire' ? <small>a year</small> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
