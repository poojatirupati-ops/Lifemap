import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import { band } from '../../../../domain/planning/bands.ts'
import { CATEGORIES, toolsIn } from '../../../../components/explore/tools.data.ts'
import ExploreRow from '../../../../components/explore/ExploreRow.tsx'
import FocusArea from '../../../../components/explore/FocusArea.tsx'
import Strip from '../../../../components/explore/Strip.tsx'
import ToolCard from '../../../../components/explore/ToolCard.tsx'
import WatchPicks from '../../../../components/explore/WatchPicks.tsx'
import { toolsForYou } from '../../../../domain/explore/picks.ts'
import { useGoalPicks } from '../../../../hooks/useGoalPicks.ts'
import Sec from '../../../../components/ui/Sec.tsx'
import { openCategory } from '../../../../state/explore.ts'
import { useStore } from '../../../../state/store.ts'

export const Route = createFileRoute('/_auth/_app/explore/')({ component: ExploreHome })

function ExploreHome() {
  const { goals, slipping, percent, nudge } = useGoalPicks()
  const specs = goals.map((goal) => goal.spec)
  return (
    <AppScreen
      id="XPL-01"
      note="Explore (journey-spec §17 order): what-ifs for slipping goals first (after a plan), Focus on one area (topics that lead to the right expert), tools for you, short videos + live sessions, then Calculators: 7 groups as list rows, 32 calculators. Works before a plan."
      title="Explore"
      sub="Tools, calculators and short videos. Try anything, no plan needed."
      bell
    >
      <Sec title="Focus on one area" />
      <FocusArea />
      <Sec title="Tools for you" />
      <Strip>
        {toolsForYou(specs).map((toolId) => (
          <ToolCard key={toolId} id={toolId} />
        ))}
      </Strip>
      <WatchPicks specs={specs} nudgeSpec={nudge?.spec} nudgeGoal={nudge?.name} />
      <Sec title="Calculators" />
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
      {slipping.length > 0 ? <Sec title="What-ifs for your goals" /> : null}
      {slipping.map((goal) => (
        <ExploreRow
          key={goal.id}
          emoji={goal.emoji}
          iconStyle={{ background: `var(--${band(percent[goal.id])}-l)` }}
          title={`Try a what-if for ${goal.name.toLowerCase()}`}
          sub={`${percent[goal.id]}% covered now`}
          onClick={() => useStore.getState().tryWhatIf(goal.id)}
          data-a="gowi"
          data-p={goal.id}
        />
      ))}
      <p className="disc">
        Calculators and videos explain general topics. Figures are illustrative, not a guarantee and
        not advice.
      </p>
    </AppScreen>
  )
}
