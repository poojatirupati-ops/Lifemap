import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../components/frame/AppScreen.tsx'
import HomeStart from '../../../components/home/HomeStart.tsx'
import { missingChoices } from '../../../domain/planning/requiredChoices.ts'
import AskBar from '../../../components/home/AskBar.tsx'
import FoundationLadder from '../../../components/home/FoundationLadder.tsx'
import GoalCard from '../../../components/home/GoalCard.tsx'
import HomeGreeting from '../../../components/home/HomeGreeting.tsx'
import HomeHero from '../../../components/home/HomeHero.tsx'
import HomeTimeline from '../../../components/home/HomeTimeline.tsx'
import Readiness from '../../../components/home/Readiness.tsx'
import Shortcuts from '../../../components/home/Shortcuts.tsx'
import UpNext from '../../../components/home/UpNext.tsx'
import { useHome } from '../../../components/home/useHome.ts'
import SeeLink from '../../../components/home/SeeLink.tsx'
import RoughNote from '../../../components/plan/RoughNote.tsx'
import { useMissingChoices } from '../../../hooks/useMissingChoices.ts'
import Sec from '../../../components/ui/Sec.tsx'
import GateNote from '../../../components/ui/GateNote.tsx'
import { useStore } from '../../../state/store.ts'

function Body() {
  const home = useHome()
  const missing = useMissingChoices()
  const { fixChoice } = useStore.getState()

  if (missing.length)
    return (
      <>
        <HomeGreeting stage={home.stage} />
        <GateNote where="home" missing={missing} onChoose={fixChoice} />
      </>
    )

  return (
    <>
      <HomeHero stage={home.stage} />
      <div className="h0over">
        <HomeTimeline byAge={home.byAge} profileAnswers={home.profileAnswers} />
      </div>
      <AskBar />
      <Sec title="Up next">
        <SeeLink section="results">See progress</SeeLink>
      </Sec>
      <UpNext step={home.step} />
      <Readiness
        percent={home.readiness}
        onTrack={home.onTrack}
        goals={home.byAge.length}
        rough={home.rough}
      />
      <div className="card" id="h-fnd">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <b style={{ fontSize: 15 }}>Your financial foundations</b>
          <SeeLink section="fnd">See all</SeeLink>
        </div>
        <FoundationLadder levels={home.levels} compact />
      </div>
      <RoughNote />
      <Sec title="Your goals">
        <SeeLink section="results">See results</SeeLink>
      </Sec>
      <div className="hstrip gcards">
        {home.byAge.map((goal) => (
          <GoalCard key={goal.id} goal={goal} percent={home.percent[goal.id]} />
        ))}
      </div>
      <Sec title="Shortcuts" />
      <Shortcuts />
      <p className="disc">
        Guidance, not advice. Figures are illustrative and based on your details and our
        assumptions.
      </p>
    </>
  )
}

export const Route = createFileRoute('/_auth/_app/home')({ component: HomeTab })

/** Home: the dashboard once there are results, else the start page. */
function HomeTab() {
  const hasResults = useStore((store) => store.plan.hasResults)
  const gated = useStore((store) => missingChoices(store.plan).length > 0)
  if (!hasResults) return <HomeStart />
  return (
    <AppScreen
      id="HOME"
      note={
        gated
          ? 'Home while a required choice is missing (§14): no numbers until it is made.'
          : 'Home (layout v7, 11 Oct 2026): greeting with date, Ask bar, Your Timeline card (total planned, goal stems by age, Profile / Goals / Next goal strip), Up next, readiness, foundations, goal photo cards, shortcuts.'
      }
      bell
    >
      <Body />
    </AppScreen>
  )
}
