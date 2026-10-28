import { Fragment } from 'react'
import { GOAL_CATEGORIES } from '../domain/discovery/goals.data.ts'
import { useStore } from '../state/store.ts'
import AppHead from '../components/frame/AppHead.tsx'
import GoalTile from '../components/define/GoalTile.tsx'
import Emo from '../components/ui/Emo.tsx'
import { showSection } from '../components/plan/planActions.ts'

export const key = 'GOALS'
export const id = 'PLAN-ADD'
export const note = 'Add a goal from My Plan (same goal tiles).'

const backToTimeline = () => showSection('timeline')

export const Head = () =>
  AppHead({ title: 'Add a goal', sub: 'Tap to add or remove.', back: backToTimeline })

export function Body() {
  const goals = useStore((store) => store.plan.goals)
  return (
    <>
      <div className="gtiles" role="group" aria-label="Goals">
        {GOAL_CATEGORIES.map(({ key }) => (
          <GoalTile key={key} goalKey={key} />
        ))}
      </div>
      {goals
        .filter((goal) => goal.k === 'other')
        .map((goal) => (
          <Fragment key={goal.id}>
            <div className="pill mint" style={{ marginTop: 10 }}>
              <Emo>{`${goal.e} ${goal.name}`}</Emo>
            </div>{' '}
          </Fragment>
        ))}
    </>
  )
}

export const Foot = () => (
  <button className="btn" data-a="seg" data-p="timeline" onClick={backToTimeline}>
    Back to my timeline
  </button>
)
