// What the Me tab's buttons do.
// TODO(Q-01): move into an identity slice in src/state once the store has per-context slices.
import { postConsents } from '../../auth/consents.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import { isProfileComplete, suggestedHorizonFor } from '../../domain/discovery/profile.ts'
import { MONEY_PROFILE } from '../../domain/discovery/questions.data.ts'
import { riskLabelText } from '../../domain/discovery/riskRead.ts'
import { riskReadFor } from '../../domain/discovery/planRiskRead.ts'
import { cropSquareJpeg } from '../../lib/cropSquareJpeg.ts'
import type { Plan } from '../../state/types.ts'
import { updateMe } from './mePlan.ts'

const PLAN_BUILDER_SCREENS = new Set([
  'B1',
  'F1',
  'F2',
  'F4',
  'B4',
  'P1',
  'P1E',
  'P1S',
  'P1K',
  'P2',
  'P3',
  'PU',
  'P4',
])
const AVATAR_SIZE = 240

/** Your full money profile from the Me tab: the result, the re-check, or the questions. */
export function toProfile() {
  updateMe((plan) => {
    plan.mePage = isProfileComplete(plan) ? (plan.moneyProfile.rechecked ? 'umr' : 'recheck') : 'um'
  })
}

/** Before a plan exists, My money opens the plan builder. */
export function makePlan() {
  const { screen, go } = useStore.getState()
  updateMe((plan) => {
    plan.tab = 'plan'
    plan.planBuilder = true
  })
  go(PLAN_BUILDER_SCREENS.has(screen) ? screen : 'B1')
}

/** Leave the profile for where the customer came from: My Plan's results or the adviser meeting. */
export function returnFromProfile(to: string) {
  updateMe((plan) => {
    plan.moneyProfile.returnTo = null
    plan.tab = to
    if (to === 'exp') plan.expertsPage = 'home'
    else {
      plan.planSegment = 'main'
      plan.planScrollTo = 'results'
    }
  })
}

export function continueToAdviserMatch() {
  updateMe((plan) => {
    plan.moneyProfile.returnTo = null
    plan.tab = 'exp'
    plan.expertsPage = 'c1'
  })
}

export function confirmFirstAnswers() {
  updateMe((plan) => {
    plan.moneyProfile.rechecked = true
    plan.editingAnswers = {}
    plan.mePage = 'home'
  })
  toast('Thanks. Your first answers are confirmed')
}

/** Reminders are optional: switching them off is recorded as easily as switching them on. */
export function setReminders(on: boolean) {
  updateMe((plan) => void (plan.account.marketingConsent = on))
  void postConsents({ terms: true, marketing: on })
}

export function toggleAdviserQuestion(question: string) {
  updateMe((plan) => {
    plan.adviserQuestions = plan.adviserQuestions.includes(question)
      ? plan.adviserQuestions.filter((q) => q !== question)
      : [...plan.adviserQuestions, question]
  })
}

/** A square, centre-cropped JPEG of the chosen picture becomes the profile photo. */
export async function changePhoto(file: File | undefined) {
  if (!file) return
  if (!file.type.startsWith('image/')) return toast('Please choose an image')
  const photo = await cropSquareJpeg(file, AVATAR_SIZE)
  updateMe((plan) => void (plan.account.photo = photo))
  toast('Photo updated')
}

export function openProfileSection(step: number) {
  updateMe((plan) => {
    plan.moneyProfile.section = step
    plan.mePage = 'ums'
  })
}

export const sectionOf = (plan: Plan) => MONEY_PROFILE.find(({ step }) => step === plan.moneyProfile.section)!

/** Save one money-profile section; an unanswered horizon takes the timeline's suggestion. */
export function saveProfileSection() {
  const section = sectionOf(useStore.getState().plan)
  updateMe((plan) => {
    const asksHorizon = section.questions.some(
      (entry) => typeof entry !== 'string' && entry.id === 'u9',
    )
    if (asksHorizon && plan.moneyProfile.answers.u9 == null) plan.moneyProfile.answers.u9 = suggestedHorizonFor(plan)
    plan.moneyProfile.done[section.step] = true
    plan.editingAnswers = {}
    if (MONEY_PROFILE.every(({ step }) => plan.moneyProfile.done[step])) plan.moneyProfile.rechecked = true
    plan.mePage = 'um'
  })
  const plan = useStore.getState().plan
  toast(
    isProfileComplete(plan)
      ? `Saved. Your plan's risk profile is now ${riskLabelText(riskReadFor(plan, true))}`
      : `${section.title} saved`,
  )
}
