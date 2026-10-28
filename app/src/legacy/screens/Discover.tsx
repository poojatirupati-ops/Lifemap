import DiscoverProgress from '../components/discover/DiscoverProgress.tsx'
import DiscoverQuestion from '../components/discover/DiscoverQuestion.tsx'
import { CHAPTER_OF } from '../components/discover/chapters.data.ts'
import { useDiscover } from '../components/discover/useDiscover.ts'
import '../components/discover/discover.css'
import type { Route } from '../shell/route.ts'

export const route: Route = { path: '/discover', public: true }

export default function Discover() {
  const d = useDiscover()
  const chapter = CHAPTER_OF[d.q.id]!
  return (
    <section className="disc">
      <div className="disc-top">
        <DiscoverProgress chapter={chapter} />
      </div>
      <DiscoverQuestion key={d.q.id} q={d.q} chapter={chapter} selected={d.selected} onPick={d.answer} />
    </section>
  )
}
