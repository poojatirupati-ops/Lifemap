import { createFileRoute } from '@tanstack/react-router'
import { Fragment } from 'react'
import { GOAL_CATEGORIES } from '../../../../domain/discovery/goals.data.ts'
import { useStore } from '../../../../state/store.ts'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import GoalTile from '../../../../components/define/GoalTile.tsx'
import Emo from '../../../../components/ui/Emo.tsx'

const backToTimeline = () => useStore.getState().showSection('timeline')

export const Route = createFileRoute('/_auth/_app/plan/add')({ component: PlanAddGoal })

function PlanAddGoal() {
  const goals = useStore((store) => store.plan.goals)
  return (
    <AppScreen
      id="PLAN-ADD"
      note={'Add a goal from My Plan (same goal tiles).'}
      title="Add a goal"
      sub="Tap to add or remove."
      back={backToTimeline}
      foot={
        <button className="btn" data-a="seg" data-p="timeline" onClick={backToTimeline}>
          Back to my timeline
        </button>
      }
    >
      <div className="gtiles" role="group" aria-label="Goals">
        {GOAL_CATEGORIES.map(({ key }) => (
          <GoalTile key={key} goalKey={key} />
        ))}
      </div>
      {goals
        .filter((goal) => goal.key === 'other')
        .map((goal) => (
          <Fragment key={goal.id}>
            <div className="pill mint" style={{ marginTop: 10 }}>
              <Emo>{`${goal.emoji} ${goal.name}`}</Emo>
            </div>{' '}
          </Fragment>
        ))}
    </AppScreen>
  )
}
