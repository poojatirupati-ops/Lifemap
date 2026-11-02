import { useShallow } from 'zustand/react/shallow'
import AskBar from '../components/home/AskBar.tsx'
import PlanCard from '../components/home/PlanCard.tsx'
import ProfileCard from '../components/home/ProfileCard.tsx'
import StartHero from '../components/home/StartHero.tsx'
import ToolList from '../components/home/ToolList.tsx'
import { toolsForYou, videosForYou } from '../domain/explore/picks.ts'
import WatchPicks from '../components/explore/WatchPicks.tsx'
import { VIDEOS } from '../components/explore/videos.data.ts'
import HdrBar from '../components/frame/HdrBar.tsx'
import { useStore } from '../state/store.ts'

export const key = 'HOME0'
export const id = 'HOME-0'
export const note =
  "Home before a plan (layout v15, 11 Oct 2026, from the customer's insurance-app reference): gradient hero with greeting, glass pill to the money personality, overlapping Make my plan card, tools as service chips, personality e-card with terms, videos."

// HdrBar is hook-free and called as a function so splitHead sees .topbar.hdr and pins it.
export const Head = () => HdrBar({})

export function Body() {
  const specs = useStore(useShallow((store) => store.plan.goals.map((goal) => goal.spec)))
  return (
    <>
      <StartHero />
      <PlanCard />
      <AskBar />
      <ToolList ids={toolsForYou(specs)} />
      <ProfileCard />
      <WatchPicks videos={videosForYou(VIDEOS, specs)} />
      <p className="disc">Guidance, not advice.</p>
    </>
  )
}
