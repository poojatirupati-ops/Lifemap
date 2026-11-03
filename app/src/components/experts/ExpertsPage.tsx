import BookedCard from './BookedCard.tsx'
import CalBooking from './CalBooking.tsx'
import ExpertsFoot from './ExpertsFoot.tsx'
import SharePicks from './SharePicks.tsx'
import { headOf, STAGES } from './stages.ts'
import { preload } from 'react-dom'
import { EMBED_JS, useActiveBooking, useAdviser } from '../../bookings/bookings.ts'
import { useLiveSessions } from '../../content/cms.tsx'
import { discoverAnswered } from '../../domain/discovery/profileQuestions.ts'
import { EXPERTS, type ExpertKind } from '../../domain/identity/advisers.data.ts'
import {
  firstName,
  initials,
  needsProfile,
  specialistFor,
  stageOf,
  type Specialist,
  type Stage,
} from '../../domain/identity/booking.ts'
import { useProjection } from '../../hooks/useProjection.ts'
import { toast } from '../../state/shell.ts'
import { makePlan } from '../../state/plan.ts'
import { useStore } from '../../state/store.ts'
import LiveCard from '../explore/LiveCard.tsx'
import AppScreen from '../frame/AppScreen.tsx'
import Sec from '../ui/Sec.tsx'

const KINDS = Object.keys(EXPERTS) as ExpertKind[]
const SPACED = { marginBottom: 8 }
const DOCUMENTS = ['Latest pension statement', 'Mortgage statement (last 12 months)']
const NEXT_STEPS = [
  { icon: '🔎', title: 'Your adviser reviews your plan' },
  {
    icon: '📞',
    title: 'A short verification call',
    detail: 'Confirm details and add any missing documents securely',
  },
  { icon: '🤝', title: 'You agree your personal plan together' },
  { icon: '🚀', title: 'You take action' },
  { icon: '🔔', title: 'LifeMap keeps tracking and reminds you about reviews' },
]

/** What happens after booking, as numbered steps. */
const nextSteps = (
  <div className="card bk-next">
    <h3 className="h">What happens next</h3>
    <ol className="bk-steps">
      {NEXT_STEPS.map(({ icon, title, detail }, index) => (
        <li key={title}>
          <span className="bk-n" aria-hidden="true">
            {icon}
          </span>
          <div>
            <b>
              {index + 1}. {title}
            </b>
            {detail ? <small>{detail}</small> : null}
          </div>
        </li>
      ))}
    </ol>
  </div>
)

/** The picked kind of expert, else the one for the least covered goal. */
function useSpecialist() {
  const booking = useStore((store) => store.plan.booking)
  const goals = useStore((store) => store.plan.goals)
  const hasResults = useStore((store) => store.plan.hasResults)
  const { base } = useProjection()
  return specialistFor({ booking, goals, hasResults }, base.percent)
}

/** The Experts tab: its home (before or after booking) or a booking step, from the URL (/experts or /experts/c0 to c4). */
export default function ExpertsPage({ step }: { step?: Stage }) {
  const stage = useStore((store) => stageOf(step ?? 'home', store.plan.booking.done))
  const { kind } = useSpecialist()
  const hasResults = useStore((store) => store.plan.hasResults)
  const adviserName = useAdviser()?.name
  const head = headOf(stage, { kind, hasResults, adviserName })
  const showStage = useStore((store) => store.showStage)
  return (
    <AppScreen
      id={STAGES[stage].id}
      note={STAGES[stage].note}
      title={head.title}
      sub={head.sub}
      back={head.back ? () => showStage(head.back!) : undefined}
      bell
      // the original has no foot once booked
      foot={stage === 'booked' ? undefined : <ExpertsFoot stage={stage} />}
    >
      <Body stage={stage} />
    </AppScreen>
  )
}

/** A one-line prompt with a link, e.g. "Check your profile before your adviser meeting". */
function Nudge({
  icon,
  text,
  action,
  onAction,
}: {
  icon: string
  text: string
  action: string
  onAction: () => void
}) {
  return (
    <div className="nudge">
      <span aria-hidden="true">{icon}</span>
      <span>{text}</span>
      <button className="link" onClick={onAction}>
        {action}
      </button>
    </div>
  )
}

/** "Talk to a specialist": one toggle per kind of expert. */
function SpecialistBoxes({ selected }: { selected: ExpertKind }) {
  const toggleSpecialist = useStore((store) => store.toggleSpecialist)
  return (
    <>
      <Sec title="Talk to a specialist" />
      <div role="group" aria-label="Talk to a specialist">
        {KINDS.map((kind) => {
          const { title, blurb, icon } = EXPERTS[kind]
          const on = kind === selected
          return (
            <button
              key={kind}
              className={on ? 'goal spec sel' : 'goal spec'}
              aria-pressed={on}
              data-a="spec"
              data-p={kind}
              onClick={() => toggleSpecialist(kind)}
            >
              <span className="ic" aria-hidden="true">
                {icon}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b>{title}</b>
                <br />
                <span className="small">{blurb}</span>
              </span>
              <span className="ck2" aria-hidden="true">
                ✓
              </span>
              <span className="chev" aria-hidden="true">
                ›
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function matchReason({ kind, picked, goal }: Specialist) {
  if (picked)
    return (
      <>
        You chose a <b>{EXPERTS[kind].title.toLowerCase()}</b>.
      </>
    )
  if (goal)
    return (
      <>
        Matched because <b>{goal.name.toLowerCase()}</b> is where you could gain most.
      </>
    )
  return <>A financial planner looks at your whole picture.</>
}

/** "What's on": every live session with an expert. */
function LiveSessions() {
  const sessions = useLiveSessions()
  return (
    <>
      <Sec title="What's on · live with experts" />
      {sessions.map((session) => (
        <LiveCard key={session.title} session={session} style={SPACED} />
      ))}
    </>
  )
}

/** The step's content (also checked against the original on its own). */
export function Body({ stage }: { stage: Stage }) {
  useActiveBooking() // loads the saved booking; a booking made or cancelled elsewhere shows here
  const adviser = useAdviser()
  const hasResults = useStore((store) => store.plan.hasResults)
  const profileNeeded = useStore(({ plan }) => needsProfile(plan))
  const answered = useStore((store) => discoverAnswered(store.plan.answers))
  const { nextAdviser, checkProfile } = useStore.getState()
  const specialist = useSpecialist()
  const adviserFirstName = firstName(adviser?.name ?? '')

  const planNudge = hasResults ? null : (
    <Nudge
      icon="🗺️"
      text="Make your plan first so your adviser can see it. You can still book now."
      action="Make my plan"
      onAction={makePlan}
    />
  )
  const profileNudge = profileNeeded ? (
    <Nudge
      icon="🧭"
      text="Check your profile before your adviser meeting"
      action="Check now"
      onAction={checkProfile}
    />
  ) : null
  // the tenant's advisers (GET /api/advisers); none yet or none at all: no card
  const adviserCard = adviser ? (
    <div className="card adv2">
      <div className="av2-top">
        <span className="av2-face" aria-hidden="true">
          {initials(adviser.name)}
          <i className="av2-on"></i>
        </span>
        <div className="av2-id">
          <span className="av2-tag">Your match</span>
          <b>{adviser.name}</b>
          <span>
            {EXPERTS[specialist.kind].title}
            {adviser.profile ? ` · ${adviser.profile.qualifications}` : null}
          </span>
        </div>
      </div>
      {adviser.profile ? (
        <div className="av2-chips">
          <span>🗣️ {adviser.profile.languages}</span>
          <span>📍 {adviser.profile.location}</span>
          <span>💻 {adviser.profile.meetingMode}</span>
        </div>
      ) : null}
      <p className="av2-why">
        <span aria-hidden="true">✨</span>
        {matchReason(specialist)}
      </p>
    </div>
  ) : null
  const specialists = <SpecialistBoxes selected={specialist.kind} />

  switch (stage) {
    case 'c0':
      return (
        <>
          <div className="xbanner" aria-hidden="true"></div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 46 }} aria-hidden="true">
              🧭
            </div>
            <b style={{ fontSize: 17 }}>6 quick questions, about 2 min</b>
            <p className="small">
              You can choose to share this with your adviser, so you won't repeat yourself.{' '}
              {answered} of your answers are already filled in.
            </p>
          </div>
          {specialists}
        </>
      )
    case 'c1':
      return (
        <>
          {planNudge}
          {profileNudge}
          {adviserCard}
          <button className="link" onClick={nextAdviser}>
            See another match
          </button>
          {' · '}
          <button
            className="link"
            onClick={() => toast(`${adviserFirstName} will call you within 1 working day`)}
          >
            Request a call back
          </button>
          {specialists}
        </>
      )
    case 'c2':
      preload(EMBED_JS, { as: 'script' }) // c3's calendar comes next
      return (
        <>
          {planNudge}
          <SharePicks adviserName={adviser?.name ?? ''} />
        </>
      )
    case 'c3':
      return <CalBooking />
    case 'c4':
      return (
        <>
          <BookedCard />
          {profileNudge}
          {nextSteps}
        </>
      )
    case 'booked':
      return (
        <>
          {profileNudge}
          <BookedCard />
          <div className="card">
            <b>Documents your adviser asked for</b>
            {DOCUMENTS.map((document) => (
              <div className="mini" key={document}>
                <span>📄 {document}</span>
                <button
                  className="link"
                  onClick={() => toast(`Sent securely to ${adviserFirstName}`)}
                >
                  Upload
                </button>
              </div>
            ))}
          </div>
          {nextSteps}
        </>
      )
    case 'home':
      return (
        <>
          {planNudge}
          {profileNudge}
          {adviserCard}
          {specialists}
          <LiveSessions />
        </>
      )
  }
}
