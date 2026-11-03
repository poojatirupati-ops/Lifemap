import { useStore } from '../../state/store.ts'
import GoalRow from '../timeline/GoalRow.tsx'
import Sec from '../ui/Sec.tsx'

/** Under the timeline: every goal's row while editing, or the one goal tapped on the timeline. */
export default function PlanGoalEdit() {
  const editAll = useStore((store) => store.editingGoals)
  const goals = useStore((store) => store.plan.goals)
  const toggleEditGoals = useStore((store) => store.toggleEditGoals)
  const closeGoalEdit = useStore((store) => store.closeGoalEdit)
  const tapped = useStore((store) =>
    store.plan.goals.find((goal) => goal.id === store.highlightedGoal),
  )

  if (editAll)
    return (
      <>
        <Sec title="Your goals">
          <button className="link" data-a="planedit" onClick={toggleEditGoals}>
            Done
          </button>
        </Sec>
        {goals
          .toSorted((a, b) => a.age - b.age)
          .map((goal) => (
            <GoalRow key={goal.id} goal={goal} />
          ))}
      </>
    )
  if (!tapped) return null
  return (
    <div id="tl-edit">
      <GoalRow goal={tapped} />
      <button className="link" data-a="tlclose" onClick={closeGoalEdit}>
        Done
      </button>
    </div>
  )
}
