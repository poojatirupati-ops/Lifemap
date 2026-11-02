// What Your money profile (B4, Understand Me) does.
// TODO(Q-01): move into a discovery slice in src/state once the store has per-context slices.
import { suggestedHorizonFor } from '../../domain/discovery/profile.ts'
import {
  NEW_QUESTIONS,
  PROFILE_SECTIONS,
  answerOf,
  editKey,
  type ProfileQuestion,
} from '../../domain/discovery/profileQuestions.ts'
import { fillKnownFinances } from '../../state/finances.ts'
import { useStore } from '../../state/store.ts'

export function pickProfileAnswer(entry: ProfileQuestion, option: number) {
  useStore.getState().update((plan) => {
    if (entry.discover) {
      plan.answers[entry.question.id] = option
      delete plan.editingAnswers[editKey(entry)]
    } else {
      plan.moneyProfile.answers[entry.question.id] = option
    }
  })
}

export const editProfileAnswer = (entry: ProfileQuestion) =>
  useStore.getState().update((plan) => {
    plan.editingAnswers[editKey(entry)] = true
  })

export const toggleProduct = (product: string) =>
  useStore.getState().update(({ moneyProfile: um }) => {
    um.chips = um.chips.includes(product)
      ? um.chips.filter((chip) => chip !== product)
      : [...um.chips, product]
  })

/** Save (or skip) the money profile, then on to the account check, or straight to Your finances. */
export function finishProfile() {
  const { update, go } = useStore.getState()
  update((plan) => {
    const horizon = NEW_QUESTIONS.find(({ question }) => question.id === 'u9')!
    const startedOthers = NEW_QUESTIONS.some((q) => q !== horizon && answerOf(plan, q) != null)
    if (answerOf(plan, horizon) == null && startedOthers) plan.moneyProfile.answers.u9 = suggestedHorizonFor(plan)
    for (const section of PROFILE_SECTIONS) {
      const complete = section.entries.every((entry) => answerOf(plan, entry) != null)
      if (complete) plan.moneyProfile.done[section.step] = true
    }
    if (plan.account.emailVerified) fillKnownFinances(plan)
  })
  go(useStore.getState().plan.account.emailVerified ? 'P2' : 'P1')
}
