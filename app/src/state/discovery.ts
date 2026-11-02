import { prefersReducedMotion } from '../hooks/reducedMotion.ts'
import { DISCOVER_SIX } from '../domain/discovery/questions.data.ts'
import { toast } from './shell.ts'
import type { SetStore, Store } from './store.ts'

const LAST_QUESTION = DISCOVER_SIX.length - 1
/** The chosen answer shows for a moment before the next question. */
const ADVANCE_DELAY_MS = 450

export const questionScreen = (index: number) => `D${index + 2}`

/** What the Discover questions and the reveal do. */
export interface DiscoveryActions {
  /** What brought the customer here (D1); the keys are stored in plan.why. */
  toggleReason: (reason: string) => void
  showQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  backFromReveal: () => void
  /** One tap answers and, after a moment, moves on (unless the customer already has). */
  pickAnswer: (option: number) => void
  wantEmergencyFund: () => void
  /** Onboarding is done: into the app's Home, where "Make my plan" starts the plan. */
  finishOnboarding: () => void
}

export function createDiscoverySlice(set: SetStore, get: () => Store): DiscoveryActions {
  return {
    toggleReason: (reason) => {
      get().update((plan) => {
        plan.why = plan.why.includes(reason)
          ? plan.why.filter((key) => key !== reason)
          : [...plan.why, reason]
      })
    },
    showQuestion: (index) => {
      get().update((plan) => void (plan.discoverStep = index))
      get().go(questionScreen(index))
    },
    nextQuestion: () => {
      const index = get().plan.discoverStep
      if (index >= LAST_QUESTION) get().go('DR')
      else get().showQuestion(index + 1)
    },
    previousQuestion: () => {
      const index = get().plan.discoverStep
      if (index <= 0) get().go('D1')
      else get().showQuestion(index - 1)
    },
    backFromReveal: () => get().showQuestion(LAST_QUESTION),
    pickAnswer: (option) => {
      const index = get().plan.discoverStep
      const { id } = DISCOVER_SIX[index]
      get().update((plan) => void (plan.answers[id] = option))
      const delay = prefersReducedMotion() ? 0 : ADVANCE_DELAY_MS
      setTimeout(() => {
        const { plan, screen } = get()
        if (screen === questionScreen(index) && plan.discoverStep === index) get().nextQuestion()
      }, delay)
    },
    wantEmergencyFund: () => {
      get().update((plan) => {
        plan.safetyWanted = true
        plan.safetyOff = false
      })
      toast("We'll add an Emergency fund to your goals")
    },
    finishOnboarding: () => {
      get().update((plan) => void (plan.onboarded = true))
      set({ inShell: true, tab: 'home', sheet: null })
      toast("Welcome! Make your plan whenever you're ready")
    },
  }
}
