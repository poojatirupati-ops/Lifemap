import { useStore } from '../state/store.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import TimelineBoard from '../components/timeline/TimelineBoard.tsx'
import GoalRow from '../components/timeline/GoalRow.tsx'

export const key = 'F2'
export const id = 'F2'
export const note =
  'Timeline: drag chips (touch, mouse, keyboard), snap to years, lanes never overlap. Retirement flag = retirement age everywhere. Rows below are optional edits.'

const go = (screen: string) => useStore.getState().go(screen)

// A call, not <FlowHead />: the shell's splitHead pins only the progress row by reading the returned tree.
export const Head = () =>
  FlowHead({
    eye: 'Step 2 · Define',
    title: 'Your timeline',
    sub: "Drag each goal to when you'd like it. Rough is fine. You can change anything later.",
    back: () => go('F1'),
  })

export function Body() {
  const goals = useStore((store) => store.plan.goals)
  const byAge = goals.toSorted((a, b) => a.age - b.age)

  return (
    <>
      <TimelineBoard />
      <div className="sec">
        <h3>Your goals</h3>
        <button className="link" onClick={() => go('F1')}>
          ＋ Add a goal
        </button>
      </div>
      {byAge.map((goal) => (
        <GoalRow key={goal.id} goal={goal} />
      ))}
    </>
  )
}

export const Foot = () => (
  <button className="btn" onClick={() => go('F4')}>
    Next
  </button>
)
