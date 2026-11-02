// The Experts tab's steps: their ids and notes for the reviewer panel, and their heads.
import { EXPERTS } from '../../domain/identity/advisers.data.ts'
import type { Plan } from '../../state/types.ts'
import { firstName, specialistOf, type Stage } from '../../domain/identity/booking.ts'

export const STAGES: Record<Stage, { id: string; note: string }> = {
  c0: {
    id: 'C0',
    note: 'Optional: Help your adviser know you → Understand Me with 7 answers pre-filled. Skippable.',
  },
  c1: { id: 'C1', note: 'Your match: specialist type from Step 5 mapping (weakest goal).' },
  c2: {
    id: 'C2',
    note: 'Share your plan: explicit consent per item, all unticked. Referral / conflicts disclosed.',
  },
  c3: {
    id: 'C3',
    note: "Pick a time: the adviser's Cal.com calendar, prefilled with your name and email. Confirmed by Cal.com's webhook.",
  },
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

/** The step's title, subtitle and the step Back returns to. */
export function headOf(
  plan: Plan,
  stage: Stage,
  adviserName = '',
): { title: string; sub?: string; back?: Stage } {
  const adviser = firstName(adviserName)
  switch (stage) {
    case 'c0':
      return { title: 'Help your adviser know you', back: 'home' }
    case 'c1': {
      const { kind } = specialistOf(plan)
      const fits = plan.hasResults ? 'your plan' : "what you've told us"
      return {
        title: 'Your match',
        sub: `A ${EXPERTS[kind].title.toLowerCase()} who fits ${fits}.`,
        back: 'home',
      }
    }
    case 'c2':
      return {
        title: 'Share your plan',
        sub: `Choose what ${adviser} can see before you meet.`,
        back: 'c1',
      }
    case 'c3':
      return { title: 'Pick a time', sub: '45 minutes · free · no obligation', back: 'c2' }
    case 'c4':
      return { title: "You're booked ✓" }
    case 'booked':
      return { title: 'Experts', sub: 'Your adviser and meeting.' }
    case 'home':
      return {
        title: 'Experts',
        sub: 'Real advisers, when you want them. Free first call, no obligation.',
      }
  }
}
