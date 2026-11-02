import { prefersReducedMotion } from '../hooks/reducedMotion.ts'
import { DISCOVER_SIX } from '../domain/discovery/questions.data.ts'
import { toast } from './shell.ts'
import { currentPath, goTo } from '../shell/router.ts'
import type { Store } from './store.ts'

const LAST_QUESTION = DISCOVER_SIX.length - 1
/** The chosen answer shows for a moment before the next question. */
const ADVANCE_DELAY_MS = 450

export const questionScreen = (index: number) => `D${index + 2}`
/** The URL of a Discover question (index 0 is /discover/1). */
export const questionPath = (index: number) => `/discover/${index + 1}`

export function createDiscoverySlice(get: () => Store) {
  return {
    /** What brought the customer here (D1); the keys are stored in plan.why. */
    toggleReason: (reason: string) => {
      get().update((plan) => {
        plan.why = plan.why.includes(reason)
          ? plan.why.filter((key) => key !== reason)
          : [...plan.why, reason]
      })
    },
    // the question's route (routes/_auth/discover.$step.tsx) sets discoverStep
    showQuestion: (index: number) => void goTo(questionPath(index)),
    nextQuestion: () => {
      const index = get().plan.discoverStep
      if (index >= LAST_QUESTION) goTo('/personality')
      else get().showQuestion(index + 1)
    },
    previousQuestion: () => {
      const index = get().plan.discoverStep
      if (index <= 0) goTo('/why')
      else get().showQuestion(index - 1)
    },
    backFromReveal: () => get().showQuestion(LAST_QUESTION),
    /** One tap answers and, after a moment, moves on (unless the customer already has). */
    pickAnswer: (option: number) => {
      const index = get().plan.discoverStep
      const { id } = DISCOVER_SIX[index]
      get().update((plan) => void (plan.answers[id] = option))
      const delay = prefersReducedMotion() ? 0 : ADVANCE_DELAY_MS
      setTimeout(() => {
        if (currentPath() === questionPath(index) && get().plan.discoverStep === index)
          get().nextQuestion()
      }, delay)
    },
    wantEmergencyFund: () => {
      get().update((plan) => {
        plan.safetyWanted = true
        plan.safetyOff = false
      })
      toast("We'll add an Emergency fund to your goals")
    },
    /** Onboarding is done: into the app's Home, where "Make my plan" starts the plan. */
    finishOnboarding: () => {
      get().update((plan) => void (plan.onboarded = true))
      get().closeSheet()
      goTo('/home')
      toast("Welcome! Make your plan whenever you're ready")
    },
  }
}

/** What the Discover questions and the reveal do. */
export type DiscoveryActions = ReturnType<typeof createDiscoverySlice>
