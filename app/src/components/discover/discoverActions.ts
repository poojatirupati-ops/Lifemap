// What the Discover questions, the reveal and Save your results do.
// TODO(R-13): move into a discovery slice in src/state once the store has per-context slices.
import { prefersReducedMotion } from '../../hooks/reducedMotion.ts'
import { DISCOVER_SIX } from '../../domain/discovery/questions.data.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'

const LAST_QUESTION = DISCOVER_SIX.length - 1
/** The chosen answer shows for a moment before the next question. */
const ADVANCE_DELAY_MS = 450

const store = () => useStore.getState()
const questionScreen = (index: number) => `D${index + 2}`

export function showQuestion(index: number) {
  store().update((plan) => {
    plan.di = index
  })
  store().go(questionScreen(index))
}

export function nextQuestion() {
  const index = store().plan.di
  if (index >= LAST_QUESTION) store().go('DR')
  else showQuestion(index + 1)
}

export function previousQuestion() {
  const index = store().plan.di
  if (index <= 0) store().go('D1')
  else showQuestion(index - 1)
}

export const backFromReveal = () => showQuestion(LAST_QUESTION)

/** One tap answers and, after a moment, moves on (unless the customer already has). */
export function pickAnswer(option: number) {
  const index = store().plan.di
  const id = DISCOVER_SIX[index].id
  store().update((plan) => {
    plan.ans[id] = option
  })
  setTimeout(
    () => {
      const { plan, screen } = store()
      if (screen === questionScreen(index) && plan.di === index) nextQuestion()
    },
    prefersReducedMotion() ? 0 : ADVANCE_DELAY_MS,
  )
}

export function wantEmergencyFund() {
  store().update((plan) => {
    plan.safetyWanted = true
    plan.safetyOff = false
  })
  toast("We'll add an Emergency fund to your goals")
}

function enterApp(message: string) {
  store().update((plan) => {
    plan.shell = true
    plan.tab = 'home'
  })
  store().closeSheet()
  toast(message)
}

export const isEmail = (email: string) => /.+@.+\..+/.test(email)

export function saveResults(email: string, comms: boolean) {
  store().update((plan) => {
    plan.save = { email, comms, done: true, asked: true }
    plan.acct.email = email
  })
  enterApp('Email noted ✓ Sign in with it to keep your plan')
}

export function skipSaving() {
  store().update((plan) => {
    plan.save.asked = true
  })
  enterApp("Welcome! Make your plan whenever you're ready")
}
