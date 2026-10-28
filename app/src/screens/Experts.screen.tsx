import AdviserCard from '../components/experts/AdviserCard.tsx'
import BookedCard from '../components/experts/BookedCard.tsx'
import {
  adviserOf,
  answerProfileFirst,
  checkProfile,
  confirmBooking,
  firstName,
  needsProfile,
  nextAdviser,
  showStage,
  specialistFor,
  stageOf,
} from '../components/experts/booking.ts'
import LiveSessions from '../components/experts/LiveSessions.tsx'
import NextSteps from '../components/experts/NextSteps.tsx'
import Nudge from '../components/experts/Nudge.tsx'
import RequestedDocuments from '../components/experts/RequestedDocuments.tsx'
import SharePicks from '../components/experts/SharePicks.tsx'
import SlotPicker from '../components/experts/SlotPicker.tsx'
import SpecialistBoxes from '../components/experts/SpecialistBoxes.tsx'
import { useSpecialist } from '../components/experts/useSpecialist.ts'
import AppHead from '../components/frame/AppHead.tsx'
import { unseenLooks } from '../components/home/useHome.ts'
import { makePlan } from '../components/me/meActions.ts'
import { useMePlan } from '../components/me/mePlan.ts'
import { bookAdviser } from '../components/plan/planActions.ts'
import { EXPERTS } from '../domain/identity/advisers.data.ts'
import { project } from '../domain/planning/project.ts'
import { discoverAnswered } from '../domain/discovery/profile.ts'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'EXP'

const STAGES: Record<string, { id: string; note: string }> = {
  c0: {
    id: 'C0',
    note: 'Optional: Help your adviser know you → Understand Me with 7 answers pre-filled. Skippable.',
  },
  c1: { id: 'C1', note: 'Your match: specialist type from Step 5 mapping (weakest goal).' },
  c2: {
    id: 'C2',
    note: 'Share your plan: explicit consent per item, all unticked. Referral / conflicts disclosed.',
  },
  c3: { id: 'C3', note: 'Pick a time: video or in person; request another slot.' },
  c4: { id: 'C4', note: 'Booked: email + SMS + calendar file; what happens next.' },
  booked: {
    id: 'EXP-01',
    note: 'Experts tab after booking: meeting details and secure document requests.',
  },
  home: {
    id: 'EXP-00',
    note: "Experts tab (layout from the LifeGoal mobile prototype): suggested match, specialist types (pre-selected from an Explore topic), what's on (live sessions), booking. Works before a plan; consent-before-sharing kept.",
  },
}

export const id = (plan: Plan) => STAGES[stageOf(plan)].id
export const note = (plan: Plan) => STAGES[stageOf(plan)].note

export function Head() {
  const plan = useStore.getState().plan
  const adviser = firstName(adviserOf(plan).name)
  const head = (title: string, sub?: string, back?: string) =>
    AppHead({
      title,
      sub,
      back: back ? () => showStage(back) : undefined,
      needsLook: unseenLooks(plan),
    })
  switch (stageOf(plan)) {
    case 'c0':
      return head('Help your adviser know you', '', 'home')
    case 'c1': {
      const { kind } = specialistFor(plan, plan.app ? project(plan).percent : {})
      const title = EXPERTS[kind].title
      const fits = plan.app ? 'your plan' : "what you've told us"
      return head('Your match', `A ${title.toLowerCase()} who fits ${fits}.`, 'home')
    }
    case 'c2':
      return head('Share your plan', `Choose what ${adviser} can see before you meet.`, 'c1')
    case 'c3':
      return head('Pick a time', '45 minutes · free · no obligation', 'c2')
    case 'c4':
      return head("You're booked ✓")
    case 'booked':
      return head('Experts', 'Your adviser and meeting.')
    default:
      return head('Experts', 'Real advisers, when you want them. Free first call, no obligation.')
  }
}

export function Body() {
  const plan = useMePlan((plan) => plan)
  const specialist = useSpecialist()
  const adviser = adviserOf(plan)
  const adviserFirstName = firstName(adviser.name)
  const planNudge = plan.app ? null : (
    <Nudge
      icon="🗺️"
      text="Make your plan first so your adviser can see it. You can still book now."
      action="Make my plan"
      onAction={makePlan}
    />
  )
  const profileNudge = needsProfile(plan) ? (
    <Nudge
      icon="🧭"
      text="Check your profile before your adviser meeting"
      action="Check now"
      onAction={checkProfile}
    />
  ) : null
  const adviserCard = <AdviserCard adviser={adviser} specialist={specialist} />
  const specialists = <SpecialistBoxes selected={specialist.kind} />

  switch (stageOf(plan)) {
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
              {discoverAnswered(plan.ans)} of your answers are already filled in.
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
      return (
        <>
          {planNudge}
          <SharePicks adviserName={adviser.name} />
        </>
      )
    case 'c3':
      return (
        <>
          <SlotPicker />
          <button
            className="link"
            onClick={() => toast(`We've asked ${adviserFirstName} for more times`)}
          >
            Request another slot
          </button>
        </>
      )
    case 'c4':
      return (
        <>
          <BookedCard />
          {profileNudge}
          <NextSteps />
        </>
      )
    case 'booked':
      return (
        <>
          {profileNudge}
          <BookedCard />
          <RequestedDocuments adviserFirstName={adviserFirstName} />
          <NextSteps />
        </>
      )
    default:
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

export function Foot() {
  const plan = useStore((store) => store.plan)
  const { book } = plan
  const adviserFirstName = firstName(adviserOf(plan).name)
  switch (stageOf(plan)) {
    case 'c0':
      return (
        <>
          <button className="btn" onClick={answerProfileFirst}>
            Answer the questions
          </button>
          <button className="btn ghost" onClick={() => showStage('c1')}>
            Skip for now
          </button>
        </>
      )
    case 'c1':
      return (
        <button className="btn" onClick={() => showStage('c2')}>
          Choose {adviserFirstName}
        </button>
      )
    case 'c2': {
      const ready = Object.values(book.share).some(Boolean) && book.agree
      return (
        <button className="btn" id="sharego" disabled={!ready} onClick={() => showStage('c3')}>
          Pick a time
        </button>
      )
    }
    case 'c3':
      return (
        <button className="btn" disabled={!book.slot} onClick={confirmBooking}>
          Confirm booking
        </button>
      )
    case 'c4':
      return (
        <button className="btn" onClick={() => useStore.getState().switchTab('plan')}>
          Back to my plan
        </button>
      )
    case 'booked':
      return null
    default:
      return (
        <button className="btn sun" onClick={bookAdviser}>
          📅 Book my adviser meeting
        </button>
      )
  }
}
