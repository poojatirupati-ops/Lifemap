import clsx from 'clsx'
import ExpertFab from './ExpertFab.tsx'
import MortgagePlayer from './MortgagePlayer.tsx'
import ReadingCards from './ReadingCards.tsx'
import VideoRow from './VideoRow.tsx'
import LiveCard from '../explore/LiveCard.tsx'
import { TopicHero } from '../explore/TopicSheet.tsx'
import { toolById } from '../explore/tools.data.ts'
import { useJourneys, type CalculatorCard } from '../../content/cms.tsx'
import { prefersReducedMotion } from '../../hooks/reducedMotion.ts'
import { openCalculator } from '../../state/explore.ts'
import { pageKey, useMortgagePage } from '../../state/mortgage.ts'
import { useStore } from '../../state/store.ts'
import Screen from '../../shell/Screen.tsx'

const NOTE =
  'Mortgages topic page (Pooja, 15 Oct): your situation, upload, all 7 calculators as expanding cards, story videos, read and ask, live sessions, and a floating expert button.'

const JUMPS = [
  { sectionId: 'mp-calc', label: 'Calculators' },
  { sectionId: 'mp-watch', label: 'Watch' },
  { sectionId: 'mp-read', label: 'Read' },
  { sectionId: 'mp-live', label: 'Live' },
]

const jumpTo = (sectionId: string) =>
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })

/** The Mortgages topic page (/explore/topic/Mortgages). */
export default function MortgagesPage() {
  return (
    <Screen id="XPL-TOPIC" note={NOTE}>
      <Body />
    </Screen>
  )
}

/** The page's content under its own head (also checked against the original on its own). */
export function Body() {
  const situation = useMortgagePage((p) => p.situation)
  const video = useMortgagePage((p) => p.video)
  const seats = useMortgagePage((p) => p.seats)
  const { pickSituation, toggleSeat } = useMortgagePage.getState()
  const journeys = useJourneys()
  const page = journeys[situation]
  if (!page) return null

  return (
    <>
      <div className="mp">
        <TopicHero topic={page.topic} />
        <div className="dsheet2">
          <span className="dgrab" aria-hidden="true"></span>
          <h2 className="t" tabIndex={-1} style={{ margin: 0 }}>
            Mortgages
          </h2>
          <div className="small" style={{ marginTop: 4 }}>
            {page.topic.blurb}
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
        {page.live.map((session, i) => {
          const seat = pageKey(situation, i)
          return (
            <LiveCard key={session.title} session={session} who="with a mortgage broker">
              <button
                className="mp-seat"
                data-a="mpseat"
                data-p={seat}
                aria-pressed={!!seats[seat]}
                onClick={() => toggleSeat(i)}
              >
                {seats[seat] ? '✓ Seat saved' : 'Save seat'}
              </button>
            </LiveCard>
          )
        })}
        <p className="disc">Topics explain general ideas. They are not advice.</p>
      </div>
      <ExpertFab />
    </>
  )
}

/** The invitation to the 4-question borrowing quiz (the elig sheet), shown to buyers. */
function EligibilityCard() {
  return (
    <div className="elg2">
      <div
        className="elg2-ph"
        style={{ backgroundImage: 'url(/media/family-couch.jpg)' }}
        aria-hidden="true"
      >
        <span
          className="elg2-in"
          style={{ backgroundImage: 'url(/media/couple-planning.jpg)' }}
        ></span>
      </div>
      <div className="elg2-tx">
        <span className="elg2-eye">Mortgage eligibility</span>
        <b>How much could you borrow?</b>
        <p>Take our 5 minute quiz and see a rough borrowing amount and home price.</p>
        <button
          className="elg2-go"
          data-a="elig"
          onClick={() => useStore.getState().openSheet('elig')}
        >
          Start eligibility quiz <i aria-hidden="true">→</i>
        </button>
        <span className="elg2-t">
          <span aria-hidden="true">⏱</span> About 5 minutes · no credit check
        </span>
      </div>
    </div>
  )
}

/** Every mortgage calculator as a photo card, the most relevant one first; all are offered, so "7 of 7". */
function CalculatorGrid({ calculators }: { calculators: CalculatorCard[] }) {
  return (
    <>
      <div className="mp-sec" id="mp-calc">
        <h3>Calculators for you</h3>
        <span>
          {calculators.length} of {calculators.length}
        </span>
      </div>
      <div className="mp-grid">
        {calculators.map((card, i) => {
          const name = card.name ?? toolById(card.tool).name
          return (
            <button
              key={card.label}
              className={clsx('mp-gc', { big: i === 0 })}
              data-a="calc"
              data-p={card.tool}
              aria-label={`${card.label}: ${name}`}
              onClick={() => openCalculator(card.tool)}
            >
              <span
                className="gc-ph"
                style={{ backgroundImage: `url('/media/${card.photo}.jpg')` }}
                aria-hidden="true"
              ></span>
              <span className="gc-e" aria-hidden="true">
                {card.emoji}
              </span>
              <span className="gc-tx">
                <b>{card.label}</b>
                <small>{name}</small>
              </span>
              <span className="gc-go" aria-hidden="true">
                →
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
