import { createFileRoute } from '@tanstack/react-router'
import { goTo } from '../../../shell/router.ts'
import { useStore } from '../../../state/store.ts'
import FlowScreen from '../../../components/frame/FlowScreen.tsx'
import GoalRecap from '../../../components/define/GoalRecap.tsx'
import RankList from '../../../components/define/RankList.tsx'
import { confirmGoals } from '../../../state/goals.ts'

export const Route = createFileRoute('/_auth/build/review')({ component: GoalReview })

function GoalReview() {
  const ready = useStore((store) => store.plan.goals.some((goal) => goal.age && goal.amount > 0))
  return (
    <FlowScreen
      id="F4"
      note={
        'Confirm my LifeMap: recap, and "Which goal first?" ranking (journey-spec §19.8; Emergency fund first by default). Needs ≥1 goal with a when and an amount.'
      }
      eye="Step 2 · Define"
      title="Your LifeMap"
      sub="A quick check before we add your money."
      back={() => goTo('/build/timeline')}
      foot={
        <button className="btn" data-a="f4ok" disabled={!ready} onClick={confirmGoals}>
          This looks right
        </button>
      }
    >
      <GoalRecap />
      <RankList place="f4" />
      {ready ? null : (
        <p className="note" style={{ marginTop: 12 }}>
          Add an amount to at least one goal.
        </p>
      )}
      <p className="disc">Next: your money profile, a few quick questions about risk.</p>
    </FlowScreen>
  )
}
