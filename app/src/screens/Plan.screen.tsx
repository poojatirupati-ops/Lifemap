import { useLayoutEffect } from 'react'
import { useStore } from '../state/store.ts'
import AppHead from '../components/frame/AppHead.tsx'
import TimelineBoard from '../components/timeline/TimelineBoard.tsx'
import PlanGoalEdit from '../components/plan/PlanGoalEdit.tsx'
import GoalsOnTrack from '../components/plan/GoalsOnTrack.tsx'
import RankCard from '../components/plan/RankCard.tsx'
import DetailsBanner from '../components/plan/DetailsBanner.tsx'
import Results from '../components/plan/Results.tsx'
import { openAddGoal, toggleEditGoals } from '../components/plan/planActions.ts'

export const key = 'PLAN'
export const id = 'PLAN'
export const note =
  'My Plan: timeline at the top (the centre), then goals-on-track strip, then results in spec order: goals % → what we found → what if → at a glance → 3 end actions. Tap a goal to edit it.'

export const Head = () =>
  AppHead({ title: 'My Plan', sub: 'Drag your goals. Your results update below.' })

/** Where a "show me" link lands on My Plan. */
const SECTION_IDS: Record<string, string> = { results: 'r-res', wi: 'r-wi', fnd: 'r-fnd' }

/** Scroll to the section asked for (results, what-if, foundations), or to the top; once. */
function useScrollToSection() {
  const section = useStore((store) => store.plan.planGo)
  useLayoutEffect(() => {
    if (section == null) return
    const target = document.getElementById(SECTION_IDS[section] ?? '')
    if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' })
    else document.getElementById('main')?.scrollTo({ top: 0, behavior: 'instant' })
    useStore.getState().update((plan) => void (plan.planGo = null))
  }, [section])
}

export function Body() {
  const editAll = useStore((store) => store.plan.planEdit)
  useScrollToSection()

  return (
    <>
      <TimelineBoard />
      <PlanGoalEdit />
      <div className="tl-acts">
        <button className="tl-act" data-a="addgoal" onClick={openAddGoal}>
          <span aria-hidden="true">＋</span> Add a goal
        </button>
        {!editAll && (
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
