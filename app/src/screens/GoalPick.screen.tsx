import { Fragment } from 'react'
import { GOAL_CATEGORIES, suggestedGoals } from '../domain/discovery/goals.data.ts'
import { REASONS } from '../domain/identity/personality.data.ts'
import { useStore } from '../state/store.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import Emo from '../components/ui/Emo.tsx'
import GoalTile from '../components/define/GoalTile.tsx'
import SaveBanner from '../components/define/SaveBanner.tsx'

export const key = 'F1'
export const id = 'F1'
export const note =
  'Goal picker: DISC Q11 tiles + Wedding, Change the car, Health & care (LifeGoals 2.0 tile style), ordered by life stage. No limit. Retirement is an optional goal like any other (suggested first from 45, never pre-selected).'

const PLENTY = 6

export const Head = () =>
  FlowHead({
    eye: 'Step 2 · Define',
    title: "What's next in your life story?",
    sub: "Pick any. You'll place them on your timeline next.",
    back: () => useStore.getState().go('B1'),
  })

export function Body() {
  const age = useStore((store) => store.plan.about.age)
  const why = useStore((store) => store.plan.why)
  const goals = useStore((store) => store.plan.goals)

  // What brought them here comes first, then the goals for their life stage.
  const fromWhy = REASONS.filter((reason) => why.includes(reason.key)).flatMap((r) => r.goals ?? [])
  const suggested = [...new Set([...fromWhy, ...suggestedGoals(age ?? 0)])]
  const more = GOAL_CATEGORIES.map((c) => c.key).filter((k) => !suggested.includes(k))
  const otherGoals = goals.filter((goal) => goal.k === 'other')
  const picked = goals.filter((goal) => goal.kind !== 'retire').length

  return (
    <>
      <SaveBanner />
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
            <Emo>{`${goal.e} ${goal.name}`}</Emo>
          </div>{' '}
        </Fragment>
      ))}
      {picked > PLENTY && (
        <p className="note" style={{ marginTop: 12 }}>
          That's plenty. You can add more later.
        </p>
      )}
    </>
  )
}

export function Foot() {
  const count = useStore((store) => store.plan.goals.length)
  const label = count
    ? `Place ${count} goal${count === 1 ? '' : 's'} on my timeline`
    : 'Place them on my timeline'
  return (
    <button className="btn" data-a="go" data-p="F2" onClick={() => useStore.getState().go('F2')}>
      {label}
    </button>
  )
}
