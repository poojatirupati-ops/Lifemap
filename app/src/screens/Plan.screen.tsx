import { useStore } from '../state/store.ts'
import AppHead from '../components/frame/AppHead.tsx'
import TimelineBoard from '../components/timeline/TimelineBoard.tsx'
import PlanGoalEdit from '../components/plan/PlanGoalEdit.tsx'
import GoalsOnTrack from '../components/plan/GoalsOnTrack.tsx'
import RankCard from '../components/plan/RankCard.tsx'
import DetailsBanner from '../components/plan/DetailsBanner.tsx'
import Results from '../components/plan/Results.tsx'
import { useScrollToSection } from '../hooks/useScrollToSection.ts'

export const key = 'PLAN'
export const id = 'PLAN'
export const note =
  'My Plan: timeline at the top (the centre), then goals-on-track strip, then results in spec order: goals % → what we found → what if → at a glance → 3 end actions. Tap a goal to edit it.'

// a call, not <AppHead />: the shell's splitHead pins the top bar by reading the returned tree
export const Head = () =>
  AppHead({ title: 'My Plan', sub: 'Drag your goals. Your results update below.' })

export function Body() {
  const editAll = useStore((store) => store.editingGoals)
  const openAddGoal = useStore((store) => store.openAddGoal)
  const toggleEditGoals = useStore((store) => store.toggleEditGoals)
  useScrollToSection()

  return (
    <>
      <TimelineBoard />
      <PlanGoalEdit />
      <div className="tl-acts">
        <button className="tl-act" data-a="addgoal" onClick={openAddGoal}>
          <span aria-hidden="true">＋</span> Add a goal
        </button>
        {editAll ? null : (
          <button className="tl-act" data-a="planedit" onClick={toggleEditGoals}>
            <span aria-hidden="true">✎</span> Edit goals
          </button>
        )}
      </div>
      <GoalsOnTrack />
      <RankCard />
      <div id="r-res" style={{ scrollMarginTop: 8 }}>
        <div className="sec" style={{ marginTop: 18 }}>
          <h3 style={{ fontSize: 21 }}>Your results</h3>
        </div>
        <DetailsBanner />
        <Results />
      </div>
    </>
  )
}
