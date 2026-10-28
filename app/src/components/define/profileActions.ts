// What Your money profile (B4, Understand Me) does.
// TODO(Q-01): move into a discovery slice in src/state once the store has per-context slices.
import { suggestedHorizon } from '../../domain/discovery/profile.ts'
import {
  DISCOVER_SIX,
  MONEY_PROFILE,
  type DiscoverQuestion,
  type MoneyQuestion,
  discoverQuestion,
} from '../../domain/discovery/questions.data.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'
import { prefillFinances } from '../account/accountDetails.ts'

const store = () => useStore.getState()

/** A money-profile question: a Discover question asked again, or one of its own. */
export type ProfileQuestion =
  { discover: true; question: DiscoverQuestion } | { discover: false; question: MoneyQuestion }

export const profileQuestion = (entry: string | MoneyQuestion): ProfileQuestion =>
  typeof entry === 'string'
    ? { discover: true, question: discoverQuestion(entry)! }
    : { discover: false, question: entry }

/** Discover answers live in plan.ans, the money profile's own in plan.um.a. */
export const answerOf = (plan: Pick<Plan, 'ans' | 'um'>, { discover, question }: ProfileQuestion) =>
  (discover ? plan.ans : plan.um.a)[question.id] as number | undefined

const DISCOVER_IDS = DISCOVER_SIX.map((q) => q.id)

/** The 7 questions first asked here (Q6 moved here from Discover). */
export const NEW_QUESTIONS = MONEY_PROFILE.flatMap((step) => step.questions)
  .map(profileQuestion)
  .filter(({ question }) => !DISCOVER_IDS.includes(question.id))

export const suggestedHorizonFor = (plan: Pick<Plan, 'goals' | 'about' | 'retireAge'>) =>
  suggestedHorizon(plan.goals, plan.about.age ?? 0, plan.retireAge)

/** An edit key: 'd' + id for a Discover answer, the id for the profile's own. */
export const editKey = ({ discover, question }: ProfileQuestion) =>
  discover ? `d${question.id}` : question.id

export function pickProfileAnswer(entry: ProfileQuestion, option: number) {
  store().update((plan) => {
    if (entry.discover) {
      plan.ans[entry.question.id] = option
      delete plan.meEdit[editKey(entry)]
    } else {
      plan.um.a[entry.question.id] = option
    }
  })
}

export const editProfileAnswer = (entry: ProfileQuestion) =>
  store().update((plan) => {
    plan.meEdit[editKey(entry)] = true
  })

export const toggleProduct = (product: string) =>
  store().update(({ um }) => {
    um.chips = um.chips.includes(product)
      ? um.chips.filter((chip) => chip !== product)
      : [...um.chips, product]
  })

/** Save (or skip) the money profile, then on to the account check, or straight to Your finances. */
export function finishProfile() {
  store().update((plan) => {
    const horizon = NEW_QUESTIONS.find(({ question }) => question.id === 'u9')!
    const startedOthers = NEW_QUESTIONS.some((q) => q !== horizon && answerOf(plan, q) != null)
    if (answerOf(plan, horizon) == null && startedOthers) plan.um.a.u9 = suggestedHorizonFor(plan)
    for (const step of MONEY_PROFILE) {
      const complete = step.questions.every((q) => answerOf(plan, profileQuestion(q)) != null)
      if (complete) plan.um.done[step.step] = true
    }
    if (plan.acct.ev) prefillFinances(plan)
  })
  const { acct } = store().plan
  store().go(acct.ev ? 'P2' : 'P1')
}
