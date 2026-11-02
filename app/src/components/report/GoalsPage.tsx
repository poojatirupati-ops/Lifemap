// Report page 5 (as many pages as the goals need): your goals in detail.
import GoalCard from './GoalCard.tsx'
import PageFrame, { type PageProps } from './PageFrame.tsx'
import TitleBlock from './TitleBlock.tsx'
import type { PlacedGoal } from './goalPages.ts'

export interface GoalsPageProps extends PageProps {
  goals: PlacedGoal[]
  /** this goals page's index and how many goals pages there are */
  index: number
  count: number
}

export default function GoalsPage({ goals, index, count, ...frame }: GoalsPageProps) {
  const detail = frame.data.goalsDetail
  const part = count > 1 ? ` (${index + 1} of ${count})` : ''
  return (
    <PageFrame {...frame} label={`Your goals in detail${part}`}>
      <div className="lmr-body">
        <TitleBlock {...detail} eyebrow="YOUR GOALS IN DETAIL" />
        {goals.length ? null : (
          <p className="lmr-lead" style={{ marginTop: 24 }}>
            No goals yet. Add a goal in the app and it appears here.
          </p>
        )}
        <div className="lmr-gcards">
          {goals.map(({ goal, weight }) => (
            <GoalCard key={goal.name} goal={goal} weight={goals.length === 1 ? 1 : weight} />
          ))}
        </div>
        {index === count - 1 ? (
          <div className="lmr-how">
            <b>How to read this page.</b> <b>Today’s money</b> shows what things cost now;{' '}
            <b>future euros</b> add price rises. <b>Covered</b> is how much of a goal’s cost your
            income and savings meet: 100% is fully covered, 5% leaves about 95% to plan for.
          </div>
        ) : null}
      </div>
    </PageFrame>
  )
}
