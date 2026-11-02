import AppHead from '../components/frame/AppHead.tsx'
import { unseenLooks } from '../components/home/useHome.ts'
import { band } from '../components/results/journey.ts'
import { CATEGORIES, toolsIn } from '../components/explore/tools.data.ts'
import ExploreRow from '../components/explore/ExploreRow.tsx'
import FocusArea from '../components/explore/FocusArea.tsx'
import Strip from '../components/explore/Strip.tsx'
import ToolCard from '../components/explore/ToolCard.tsx'
import WatchPicks from '../components/explore/WatchPicks.tsx'
import { toolsForYou } from '../domain/explore/picks.ts'
import { useGoalPicks } from '../hooks/useGoalPicks.ts'
import { openCategory, tryWhatIf } from '../state/explore.ts'
import { useStore } from '../state/store.ts'

export const key = 'XPL'
export const id = 'XPL-01'
export const note =
  'Explore (journey-spec §17 order): what-ifs for slipping goals first (after a plan), Focus on one area (topics that lead to the right expert), tools for you, short videos + live sessions, then Calculators: 6 groups as list rows, 28 calculators. Works before a plan.'

// A call, not <AppHead />: the shell's splitHead pins the top bar by reading the returned tree.
// Head runs inside ScreenHost's render, which subscribes to the plan, so getState() is current.
export const Head = () =>
  AppHead({
    title: 'Explore',
    sub: 'Tools, calculators and short videos. Try anything, no plan needed.',
    needsLook: unseenLooks(useStore.getState().plan),
  })

export function Body() {
  const { goals, slipping, percent, nudge } = useGoalPicks()
  const specs = goals.map((goal) => goal.spec)

  return (
    <>
      {slipping.length > 0 ? (
        <div className="sec">
          <h3>What-ifs for your goals</h3>
        </div>
      ) : null}
      {slipping.map((goal) => (
        <ExploreRow
          key={goal.id}
          emoji={goal.emoji}
          iconStyle={{ background: `var(--${band(percent[goal.id])}-l)` }}
          title={`Try a what-if for ${goal.name.toLowerCase()}`}
          sub={`${percent[goal.id]}% covered now`}
          onClick={() => tryWhatIf(goal.id)}
          data-a="gowi"
          data-p={goal.id}
        />
      ))}
      <div className="sec">
        <h3>Focus on one area</h3>
      </div>
      <FocusArea />
      <div className="sec">
        <h3>Tools for you</h3>
      </div>
      <Strip>
        {toolsForYou(specs).map((toolId) => (
          <ToolCard key={toolId} id={toolId} />
        ))}
      </Strip>
      <WatchPicks specs={specs} nudgeSpec={nudge?.spec} nudgeGoal={nudge?.name} />
      <div className="sec">
        <h3>Calculators</h3>
      </div>
      {CATEGORIES.map((category) => (
        <ExploreRow
          key={category.id}
          emoji={category.emoji}
          title={category.name}
          sub={`${category.blurb} · ${toolsIn(category.id).length} tools`}
          onClick={() => openCategory(category.id)}
          data-a="cat"
          data-p={category.id}
        />
      ))}
      <p className="disc">
        Calculators and videos explain general topics. Figures are illustrative, not a guarantee and
        not advice.
      </p>
    </>
  )
}
