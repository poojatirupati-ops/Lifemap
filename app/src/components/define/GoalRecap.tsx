import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import GoalRecapRow from './GoalRecapRow.tsx'

/** Your goals, soonest first, each with when it happens and how much. */
export default function GoalRecap() {
  const goals = useStore(useShallow(({ plan }) => plan.goals.toSorted((a, b) => a.age - b.age)))

  return (
    <div className="card lmrec">
      <h3 className="h">Your goals</h3>
      <ol className="lmt">
        {goals.map((goal) => (
          <GoalRecapRow key={goal.id} goal={goal} />
        ))}
      </ol>
    </div>
  )
}
