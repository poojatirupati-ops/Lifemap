import { createFileRoute } from '@tanstack/react-router'
import { goTo } from '../../../shell/router.ts'
import { Fragment } from 'react'
import { goalPickerSections } from '../../../domain/discovery/goals.data.ts'
import { useStore } from '../../../state/store.ts'
import FlowScreen from '../../../components/frame/FlowScreen.tsx'
import Emo from '../../../components/ui/Emo.tsx'
import GoalTile from '../../../components/define/GoalTile.tsx'

const PLENTY = 6

export const Route = createFileRoute('/_auth/build/goals')({ component: GoalPick })

function GoalPick() {
  const age = useStore((store) => store.plan.about.age)
  const why = useStore((store) => store.plan.why)
  const goals = useStore((store) => store.plan.goals)

  const { suggested, more } = goalPickerSections(why, age ?? 0)
  const otherGoals = goals.filter((goal) => goal.key === 'other')
  const picked = goals.filter((goal) => goal.kind !== 'retire').length

  const count = useStore((store) => store.plan.goals.length)
  const label = count
    ? `Place ${count} goal${count === 1 ? '' : 's'} on my timeline`
    : 'Place them on my timeline'
  return (
    <FlowScreen
      id="F1"
      note={
        'Goal picker: DISC Q11 tiles + Wedding, Change the car, Health & care (LifeGoals 2.0 tile style), ordered by life stage. No limit. Retirement is an optional goal like any other (suggested first from 45, never pre-selected).'
      }
      eye="Step 2 · Define"
      title="What's next in your life story?"
      sub="Pick any. You'll place them on your timeline next."
      back={() => goTo('/build/about')}
      foot={
        <button className="btn" data-a="go" data-p="F2" onClick={() => goTo('/build/timeline')}>
          {label}
        </button>
      }
    >
      <div className="eyebrow" style={{ margin: '4px 0 8px' }}>
        Suggested for you
      </div>
      <div className="gtiles sug" role="group" aria-label="Suggested goals">
        {suggested.map((goalKey) => (
          <GoalTile key={goalKey} goalKey={goalKey} />
        ))}
      </div>
      <div className="eyebrow" style={{ margin: '18px 0 8px' }}>
        More goals
      </div>
      <div className="gtiles" role="group" aria-label="More goals">
        {more.map((goalKey) => (
          <GoalTile key={goalKey} goalKey={goalKey} />
        ))}
      </div>
      {otherGoals.map((goal) => (
        <Fragment key={goal.id}>
          <div className="pill mint" style={{ marginTop: 10 }}>
            <Emo>{`${goal.emoji} ${goal.name}`}</Emo>
          </div>{' '}
        </Fragment>
      ))}
      {picked > PLENTY ? (
        <p className="note" style={{ marginTop: 12 }}>
          That's plenty. You can add more later.
        </p>
      ) : null}
    </FlowScreen>
  )
}
