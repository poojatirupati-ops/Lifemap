import AdviserCard from '../components/experts/AdviserCard.tsx'
import BookedCard from '../components/experts/BookedCard.tsx'
import ExpertsFoot from '../components/experts/ExpertsFoot.tsx'
import LiveSessions from '../components/experts/LiveSessions.tsx'
import MatchLinks from '../components/experts/MatchLinks.tsx'
import NextSteps from '../components/experts/NextSteps.tsx'
import PlanNudge from '../components/experts/PlanNudge.tsx'
import ProfileIntro from '../components/experts/ProfileIntro.tsx'
import ProfileNudge from '../components/experts/ProfileNudge.tsx'
import RequestedDocuments from '../components/experts/RequestedDocuments.tsx'
import SharePicks from '../components/experts/SharePicks.tsx'
import SlotPicker from '../components/experts/SlotPicker.tsx'
import SpecialistBoxes from '../components/experts/SpecialistBoxes.tsx'
import { headOf, STAGES } from '../components/experts/stages.ts'
import { useSpecialist } from '../components/experts/useSpecialist.ts'
import AppHead from '../components/frame/AppHead.tsx'
import { unseenLooks } from '../components/home/useHome.ts'
import { adviserOf, firstName, stageOf } from '../domain/identity/booking.ts'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'EXP'
export const id = (plan: Plan) => STAGES[stageOf(plan)].id
export const note = (plan: Plan) => STAGES[stageOf(plan)].note
export const Foot = ExpertsFoot

// ScreenHost calls Head as a plain function (no hooks) and splits AppHead's top bar out of it
export function Head() {
  const { plan, showStage } = useStore.getState()
  const { title, sub, back } = headOf(plan)
  return AppHead({
    title,
    sub,
    back: back ? () => showStage(back) : undefined,
    needsLook: unseenLooks(plan),
  })
}

export function Body() {
  const stage = useStore(({ plan }) => stageOf(plan))
  const adviser = useStore(({ plan }) => adviserOf(plan))
  const specialist = useSpecialist()
  const adviserFirstName = firstName(adviser.name)
  const adviserCard = <AdviserCard adviser={adviser} specialist={specialist} />
  const specialists = <SpecialistBoxes selected={specialist.kind} />

  switch (stage) {
    case 'c0':
      return (
        <>
          <ProfileIntro />
          {specialists}
        </>
      )
    case 'c1':
      return (
        <>
          <PlanNudge />
          <ProfileNudge />
          {adviserCard}
          <MatchLinks adviserFirstName={adviserFirstName} />
          {specialists}
        </>
      )
    case 'c2':
      return (
        <>
          <PlanNudge />
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
          <ProfileNudge />
          <NextSteps />
        </>
      )
    case 'booked':
      return (
        <>
          <ProfileNudge />
          <BookedCard />
          <RequestedDocuments adviserFirstName={adviserFirstName} />
          <NextSteps />
        </>
      )
    case 'home':
      return (
        <>
          <PlanNudge />
          <ProfileNudge />
          {adviserCard}
          {specialists}
          <LiveSessions />
        </>
      )
  }
}
