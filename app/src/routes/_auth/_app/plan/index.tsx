import { createFileRoute } from '@tanstack/react-router'
import { redirect } from '@tanstack/react-router'
import PlanEmpty from '../../../../components/plan/PlanEmpty.tsx'
import { useStore } from '../../../../state/store.ts'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import TimelineBoard from '../../../../components/timeline/TimelineBoard.tsx'
import PlanGoalEdit from '../../../../components/plan/PlanGoalEdit.tsx'
import GoalsOnTrack from '../../../../components/plan/GoalsOnTrack.tsx'
import RankCard from '../../../../components/plan/RankCard.tsx'
import DetailsBanner from '../../../../components/plan/DetailsBanner.tsx'
import Results from '../../../../components/plan/Results.tsx'
import { useScrollToSection } from '../../../../hooks/useScrollToSection.ts'

function Body() {
  const editAll = useStore((store) => store.editingGoals)
  const { openAddGoal, toggleEditGoals } = useStore.getState()
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

// My Plan: the results once there are any, an empty state before, or the plan builder where it was left
export const Route = createFileRoute('/_auth/_app/plan/')({
  beforeLoad: () => {
    const { plan, planBuilder, builderAt } = useStore.getState()
    if (!plan.hasResults && planBuilder && builderAt) throw redirect({ href: builderAt })
  },
  component: PlanTab,
})

function PlanTab() {
  const hasResults = useStore((store) => store.plan.hasResults)
  if (!hasResults) return <PlanEmpty />
  return (
    <AppScreen
      id="PLAN"
      note={
        'My Plan: timeline at the top (the centre), then goals-on-track strip, then results in spec order: goals % → what we found → what if → at a glance → 3 end actions. Tap a goal to edit it.'
      }
      title="My Plan"
      sub="Drag your goals. Your results update below."
    >
      <Body />
    </AppScreen>
  )
}
