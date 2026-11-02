import { missingChoices } from '../components/finance/requiredChoices.ts'
import HdrBar from '../components/frame/HdrBar.tsx'
import AskBar from '../components/home/AskBar.tsx'
import FoundationLadder from '../components/home/FoundationLadder.tsx'
import GoalCard from '../components/home/GoalCard.tsx'
import HomeGreeting from '../components/home/HomeGreeting.tsx'
import HomeHero from '../components/home/HomeHero.tsx'
import HomeTimeline from '../components/home/HomeTimeline.tsx'
import Readiness from '../components/home/Readiness.tsx'
import Shortcuts from '../components/home/Shortcuts.tsx'
import UpNext from '../components/home/UpNext.tsx'
import { unseenLooks, useHome } from '../components/home/useHome.ts'
import SeeLink from '../components/home/SeeLink.tsx'
import RoughNote from '../components/plan/RoughNote.tsx'
import { useMissingChoices } from '../hooks/useMissingChoices.ts'
import GateNote from '../components/ui/GateNote.tsx'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'HOME'
export const id = 'HOME'
export const note = (plan: Plan) =>
  missingChoices(plan).length
    ? 'Home while a required choice is missing (§14): no numbers until it is made.'
    : 'Home (layout v7, 11 Oct 2026): greeting with date, Ask bar, Your Timeline card (total planned, goal stems by age, Profile / Goals / Next goal strip), Up next, readiness, foundations, goal photo cards, shortcuts.'

// only the icon bar stays pinned; the greeting scrolls with the content.
// Head is hook-free by the shell's contract (shell/screens.tsx): splitHead must see .topbar.hdr.
export const Head = () => HdrBar({ needsLook: unseenLooks(useStore.getState().plan) })

export function Body() {
  const home = useHome()
  const missing = useMissingChoices()
  const fixChoice = useStore((store) => store.fixChoice)

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
      <div className="sec">
        <h3>Up next</h3>
        <SeeLink section="results">See progress</SeeLink>
      </div>
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
      <div className="sec">
        <h3>Your goals</h3>
        <SeeLink section="results">See results</SeeLink>
      </div>
      <div className="hstrip gcards">
        {home.byAge.map((goal) => (
          <GoalCard key={goal.id} goal={goal} percent={home.percent[goal.id]} />
        ))}
      </div>
      <div className="sec">
        <h3>Shortcuts</h3>
      </div>
      <Shortcuts />
      <p className="disc">
        Guidance, not advice. Figures are illustrative and based on your details and our
        assumptions.
      </p>
    </>
  )
}
