// The money profile (B4 in the plan builder, Understand Me on the Me tab): answers, sections and the way back.
import { suggestedHorizonFor } from '../domain/discovery/profile.ts'
import {
  isProfileComplete,
  NEW_QUESTIONS,
  PROFILE_SECTIONS,
  answerOf,
  editKey,
  type ProfileQuestion,
} from '../domain/discovery/profileQuestions.ts'
import { MONEY_PROFILE } from '../domain/discovery/questions.data.ts'
import { riskLabelText } from '../domain/discovery/riskRead.ts'
import { riskReadFor } from '../domain/discovery/planRiskRead.ts'
import { fillKnownFinances } from './finances.ts'
import { toast } from './shell.ts'
import { useStore, type Store } from './store.ts'
import type { Plan } from './types.ts'
import { goTo } from '../shell/router.ts'

const update: Store['update'] = (recipe) => useStore.getState().update(recipe)

export function pickProfileAnswer(entry: ProfileQuestion, option: number) {
  update((plan, ui) => {
    if (entry.discover) {
      plan.answers[entry.question.id] = option
      delete ui.editingAnswers[editKey(entry)]
    } else {
      plan.moneyProfile.answers[entry.question.id] = option
    }
  })
}

export const editProfileAnswer = (entry: ProfileQuestion) =>
  update((_, ui) => void (ui.editingAnswers[editKey(entry)] = true))

export const toggleProduct = (product: string) =>
  update(({ moneyProfile }) => {
    moneyProfile.chips = moneyProfile.chips.includes(product)
      ? moneyProfile.chips.filter((chip) => chip !== product)
      : [...moneyProfile.chips, product]
  })

/** Save (or skip) the money profile, then on to the account check, or straight to Your finances. */
export function finishProfile() {
  update((plan) => {
    const horizon = NEW_QUESTIONS.find(({ question }) => question.id === 'u9')!
    const startedOthers = NEW_QUESTIONS.some((q) => q !== horizon && answerOf(plan, q) != null)
    if (answerOf(plan, horizon) == null && startedOthers)
      plan.moneyProfile.answers.u9 = suggestedHorizonFor(plan)
    for (const section of PROFILE_SECTIONS) {
      const complete = section.entries.every((entry) => answerOf(plan, entry) != null)
      if (complete) plan.moneyProfile.done[section.step] = true
    }
    if (plan.account.emailVerified) fillKnownFinances(plan)
  })
  goTo('/build/finances')
}

/** Your full money profile from the Me tab: the result, the re-check, or the questions. */
export const toProfile = () => goTo(useStore.getState().profilePage(useStore.getState().plan))

/** Leave the profile for where the customer came from: My Plan's results or the adviser meeting. */
export function returnFromProfile(to: string) {
  update((plan, ui) => {
    plan.moneyProfile.returnTo = null
    if (to !== 'exp') ui.planScrollTo = 'results'
  })
  goTo(to === 'exp' ? '/experts' : '/plan')
}

export function continueToAdviserMatch() {
  update((plan) => void (plan.moneyProfile.returnTo = null))
  goTo('/experts/c1')
}

export function confirmFirstAnswers() {
  update((plan, ui) => {
    plan.moneyProfile.rechecked = true
    ui.editingAnswers = {}
  })
  toast('Thanks. Your first answers are confirmed')
  goTo('/me')
}

export function openProfileSection(step: number) {
  update((plan) => void (plan.moneyProfile.section = step))
  goTo('/me/profile/section')
}

export const sectionOf = (plan: Plan) =>
  MONEY_PROFILE.find(({ step }) => step === plan.moneyProfile.section)!

/** Save one money-profile section; an unanswered horizon takes the timeline's suggestion. */
export function saveProfileSection() {
  const section = sectionOf(useStore.getState().plan)
  update((plan, ui) => {
    const asksHorizon = section.questions.some(
      (entry) => typeof entry !== 'string' && entry.id === 'u9',
    )
    if (asksHorizon && plan.moneyProfile.answers.u9 == null)
      plan.moneyProfile.answers.u9 = suggestedHorizonFor(plan)
    plan.moneyProfile.done[section.step] = true
    ui.editingAnswers = {}
    if (MONEY_PROFILE.every(({ step }) => plan.moneyProfile.done[step]))
      plan.moneyProfile.rechecked = true
  })
  goTo('/me/profile')
  const plan = useStore.getState().plan
  toast(
    isProfileComplete(plan)
      ? `Saved. Your plan's risk profile is now ${riskLabelText(riskReadFor(plan, true))}`
      : `${section.title} saved`,
  )
}
