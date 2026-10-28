import { useStore } from '../state/store.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import GoalRecap from '../components/define/GoalRecap.tsx'
import RankList from '../components/define/RankList.tsx'
import { confirmGoals } from '../components/define/goalActions.ts'

export const key = 'F4'
export const id = 'F4'
export const note =
  'Confirm my LifeMap: recap, and "Which goal first?" ranking (journey-spec §19.8; Emergency fund first by default). Needs ≥1 goal with a when and an amount.'

const useHasAPricedGoal = () =>
  useStore((store) => store.plan.goals.some((goal) => goal.age && goal.amount > 0))

export const Head = () =>
  FlowHead({
    eye: 'Step 2 · Define',
    title: 'Your LifeMap',
    sub: 'A quick check before we add your money.',
    back: () => useStore.getState().go('F2'),
  })

export function Body() {
  const ready = useHasAPricedGoal()
  return (
    <>
      <GoalRecap />
      <RankList place="f4" />
      {!ready && (
        <p className="note" style={{ marginTop: 12 }}>
          Add an amount to at least one goal.
        </p>
      )}
      <p className="disc">Next: your money profile, a few quick questions about risk.</p>
    </>
  )
}

export function Foot() {
  const ready = useHasAPricedGoal()
  return (
    <button className="btn" data-a="f4ok" disabled={!ready} onClick={confirmGoals}>
      This looks right
    </button>
  )
}
