import { createFileRoute } from '@tanstack/react-router'
import { goTo } from '../../../shell/router.ts'
import { useStore } from '../../../state/store.ts'
import FlowScreen from '../../../components/frame/FlowScreen.tsx'
import TimelineBoard from '../../../components/timeline/TimelineBoard.tsx'
import GoalRow from '../../../components/timeline/GoalRow.tsx'

export const Route = createFileRoute('/_auth/build/timeline')({ component: Timeline })

function Timeline() {
  const goals = useStore((store) => store.plan.goals)
  const byAge = goals.toSorted((a, b) => a.age - b.age)
  return (
    <FlowScreen
      id="F2"
      note={
        'Timeline: drag chips (touch, mouse, keyboard), snap to years, lanes never overlap. Retirement flag = retirement age everywhere. Rows below are optional edits.'
      }
      eye="Step 2 · Define"
      title="Your timeline"
      sub="Drag each goal to when you'd like it. Rough is fine. You can change anything later."
      back={() => goTo('/build/goals')}
      foot={
        <button className="btn" onClick={() => goTo('/build/review')}>
          Next
        </button>
      }
    >
      <TimelineBoard />
      <div className="sec">
        <h3>Your goals</h3>
        <button className="link" onClick={() => goTo('/build/goals')}>
          ＋ Add a goal
        </button>
      </div>
      {byAge.map((goal) => (
        <GoalRow key={goal.id} goal={goal} />
      ))}
    </FlowScreen>
  )
}
