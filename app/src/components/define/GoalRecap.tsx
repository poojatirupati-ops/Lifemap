import { useShallow } from 'zustand/react/shallow'
import { euro } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import { changeGoalDate } from './goalActions.ts'
import { goalWhen, hasPassed } from './goalWhen.ts'

/** Your goals, soonest first, each with when it happens and how much. */
export default function GoalRecap() {
  const plan = useStore(
    useShallow(({ plan }) => ({
      goals: plan.goals,
      about: plan.about,
      asm: plan.asm,
      fin: plan.fin,
      retireSet: plan.retireSet,
    })),
  )
  const goals = [...plan.goals].sort((a, b) => a.age - b.age)

  return (
    <div className="card lmrec">
      <h3 className="h">Your goals</h3>
      <ol className="lmt">
        {goals.map((goal) => (
          <li key={goal.id}>
            <GIcon emoji={goal.e} className="lmt-e" aria-hidden="true" />
            <span className="lmt-m">
              <b>{goal.name}</b>
              <small>{goalWhen(goal, plan)}</small>
              {hasPassed(goal, plan.about.age) && (
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
            </span>
            <span className="lmt-v">
              {euro(goal.amount)}
              {goal.kind === 'retire' && <small>a year</small>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
