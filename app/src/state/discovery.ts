import { prefersReducedMotion } from '../hooks/reducedMotion.ts'
import { DISCOVER_SIX } from '../domain/discovery/questions.data.ts'
import { toast } from './shell.ts'
import type { Plan } from './types.ts'

const LAST_QUESTION = DISCOVER_SIX.length - 1
/** The chosen answer shows for a moment before the next question. */
const ADVANCE_DELAY_MS = 450

export const questionScreen = (index: number) => `D${index + 2}`

/** What the Discover questions, the reveal and Save your results do. */
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
  saveResults: (email: string, comms: boolean) => void
  skipSaving: () => void
}

/** The store fields this slice uses (the shared slice convention; store.ts does not export Store). */
interface StoreCore {
  plan: Plan
  screen: string
  update: (recipe: (plan: Plan) => void) => void
  go: (screen: string) => void
  closeSheet: () => void
}

export function createDiscoverySlice(get: () => StoreCore & DiscoveryActions): DiscoveryActions {
  const enterApp = (message: string) => {
    get().update((plan) => {
      plan.inShell = true
      plan.tab = 'home'
    })
    get().closeSheet()
    toast(message)
  }

  return {
    toggleReason: (reason) => {
      get().update((plan) => {
        plan.why = plan.why.includes(reason)
          ? plan.why.filter((key) => key !== reason)
          : [...plan.why, reason]
      })
    },
    showQuestion: (index) => {
      get().update((plan) => {
        plan.discoverStep = index
      })
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
      get().update((plan) => {
        plan.answers[id] = option
      })
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
    saveResults: (email, comms) => {
      get().update((plan) => {
        plan.save = { email, comms, done: true, asked: true }
        plan.account.email = email
      })
      enterApp('Email noted ✓ Sign in with it to keep your plan')
    },
    skipSaving: () => {
      get().update((plan) => {
        plan.save.asked = true
      })
      enterApp("Welcome! Make your plan whenever you're ready")
    },
  }
}
