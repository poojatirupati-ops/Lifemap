import { useStore } from '../../state/store.ts'
import GoalRow from '../timeline/GoalRow.tsx'
import { closeGoalEdit, toggleEditGoals } from './planActions.ts'

/** Under the timeline: every goal's row while editing, or the one goal tapped on the timeline. */
export default function PlanGoalEdit() {
  const editAll = useStore((store) => store.plan.planEdit)
  const goals = useStore((store) => store.plan.goals)
  const tapped = useStore((store) => store.plan.goals.find((goal) => goal.id === store.plan.tlHl))

  if (editAll)
    return (
      <>
        <div className="sec">
          <h3>Your goals</h3>
          <button className="link" data-a="planedit" onClick={toggleEditGoals}>
            Done
          </button>
        </div>
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
