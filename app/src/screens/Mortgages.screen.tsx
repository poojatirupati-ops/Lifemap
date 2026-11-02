import CalculatorGrid from '../components/mortgages/CalculatorGrid.tsx'
import EligibilityCard from '../components/mortgages/EligibilityCard.tsx'
import ExpertFab from '../components/mortgages/ExpertFab.tsx'
import MortgagePlayer from '../components/mortgages/MortgagePlayer.tsx'
import ReadingCards from '../components/mortgages/ReadingCards.tsx'
import SeatCard from '../components/mortgages/SeatCard.tsx'
import VideoRow from '../components/mortgages/VideoRow.tsx'
import { topicPhotoStyle } from '../components/explore/explore.data.ts'
import { useJourneys } from '../content/cms.tsx'
import { exploreBack } from '../state/explore.ts'
import { pageKey, useMortgagePage } from '../state/mortgage.ts'

// pickScreen shows this page for the explore stack's XTOPIC 'Mortgages'
export const key = 'MORT'
export const id = 'XPL-TOPIC'
export const note =
  'Mortgages topic page (Pooja, 15 Oct): your situation, upload, all 7 calculators as expanding cards, story videos, read and ask, live sessions, and a floating expert button.'

const JUMPS = [
  { sectionId: 'mp-calc', label: 'Calculators' },
  { sectionId: 'mp-watch', label: 'Watch' },
  { sectionId: 'mp-read', label: 'Read' },
  { sectionId: 'mp-live', label: 'Live' },
]

const jumpTo = (sectionId: string) => {
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
}

export function Body() {
  const situation = useMortgagePage((p) => p.situation)
  const video = useMortgagePage((p) => p.video)
  const pickSituation = useMortgagePage((p) => p.pickSituation)
  const journeys = useJourneys()
  const page = journeys[situation]
  if (!page) return null
  const { topic } = page

  return (
    <>
      <div className="mp">
        <div className="dhero2" style={topicPhotoStyle(topic)}>
          <span className="art" aria-hidden="true"></span>
          <button className="dcirc" data-a="xback" aria-label="Back" onClick={exploreBack}>
            ‹
          </button>
        </div>
        <div className="dsheet2">
          <span className="dgrab" aria-hidden="true"></span>
          <h2 className="t" tabIndex={-1} style={{ margin: 0 }}>
            Mortgages
          </h2>
          <div className="small" style={{ marginTop: 4 }}>
            {topic.blurb}
          </div>
        </div>
        <div className="mp-sit" role="group" aria-label="Your situation">
          {journeys.map(({ name }, i) => (
            <button
              key={name}
              data-a="mpsit"
              data-p={i}
              aria-pressed={i === situation}
              onClick={() => pickSituation(i)}
            >
              {name}
            </button>
          ))}
        </div>
        <nav className="mp-jump" aria-label="On this page">
          {JUMPS.map(({ sectionId, label }) => (
            <button
              key={sectionId}
              data-a="mpjump"
              data-p={sectionId}
              onClick={() => jumpTo(sectionId)}
            >
              {label}
            </button>
          ))}
        </nav>
        {situation === 0 ? <EligibilityCard /> : null}
        <CalculatorGrid calculators={page.calculators} />
        <VideoRow videos={page.videos} />
        <div id="mp-player">
          <MortgagePlayer
            key={pageKey(situation, video)}
            story={page.videos[video]}
            number={video + 1}
            count={page.videos.length}
          />
        </div>
        <ReadingCards reading={page.reading} />
        <div className="mp-sec" id="mp-live">
          <h3>Live sessions</h3>
          <span>Free · ask experts live</span>
        </div>
        {page.live.map((session, i) => (
          <SeatCard key={session.title} index={i} {...session} />
        ))}
        <p className="disc">Topics explain general ideas. They are not advice.</p>
      </div>
      <ExpertFab />
    </>
  )
}
