// The money-profile screen's questions: sections, answers, edit keys and progress.
import {
  DISCOVER_SIX,
  MONEY_PROFILE,
  discoverQuestion,
  type DiscoverQuestion,
  type MoneyQuestion,
} from './questions.data.ts'
import type { Plan } from '../../state/types.ts'

/** Discover answers live in plan.ans, the money profile's own in plan.um. */
export type AnswerInputs = Pick<Plan, 'answers' | 'moneyProfile'>

export const discoverAnswered = (answers: AnswerInputs['answers']) =>
  DISCOVER_SIX.filter((q) => answers[q.id] != null).length

/** A money-profile question: a Discover question asked again, or one of its own. */
export type ProfileQuestion =
  { discover: true; question: DiscoverQuestion } | { discover: false; question: MoneyQuestion }

export const profileQuestion = (entry: string | MoneyQuestion): ProfileQuestion =>
  typeof entry === 'string'
    ? { discover: true, question: discoverQuestion(entry)! }
    : { discover: false, question: entry }

export const answerOf = (plan: AnswerInputs, { discover, question }: ProfileQuestion) =>
  (discover ? plan.answers : plan.moneyProfile.answers)[question.id] as number | undefined

/** An edit key: 'd' + id for a Discover answer, the id for the profile's own. */
export const editKey = ({ discover, question }: ProfileQuestion) =>
  discover ? `d${question.id}` : question.id

/** The money profile's sections, each with its questions. */
export const PROFILE_SECTIONS = MONEY_PROFILE.map((step) => ({
  ...step,
  entries: step.questions.map(profileQuestion),
}))

const PROFILE_ENTRIES = PROFILE_SECTIONS.flatMap((section) => section.entries)

const DISCOVER_IDS = DISCOVER_SIX.map((q) => q.id)

/** The 7 questions first asked here (Q6 moved here from Discover). */
export const NEW_QUESTIONS = PROFILE_ENTRIES.filter(
  ({ question }) => !DISCOVER_IDS.includes(question.id),
)

export const questionsLeft = (plan: AnswerInputs) =>
  NEW_QUESTIONS.filter((entry) => answerOf(plan, entry) == null).length

function newQuestionsStatus(left: number) {
  const all = NEW_QUESTIONS.length
  if (left === all) return `${all} quick questions`
  if (left > 0) return `${left} of ${all} left`
  return `All ${all} answered`
}

/** The money profile's sub line, e.g. "3 of 7 left · your first 6 answers are filled in". */
export function profileProgress(plan: AnswerInputs) {
  const status = newQuestionsStatus(questionsLeft(plan))
  return `${status} · your first ${discoverAnswered(plan.answers)} answers are filled in`
}

/** A Discover question already answered: shown pre-filled with Edit instead of as a card. */
export const isPrefilled = (entry: ProfileQuestion, answers: AnswerInputs['answers']) =>
  entry.discover && answers[entry.question.id] != null

/** The investment falling from one amount to another, shown above a loss question. */
export const lossPanel = ({ discover, question }: ProfileQuestion) => {
  if (!discover) return question.panel
  return question.type === 'scenario' ? ([question.from, question.to] as const) : undefined
}

/** The help line and product chips only the profile's own questions have. */
export const extras = ({ discover, question }: ProfileQuestion) =>
  discover ? {} : { help: question.help, chips: question.chips }

/** 13: the six Discover questions asked again plus the profile's own. */
export const PROFILE_QUESTIONS = PROFILE_ENTRIES.length

export const profileAnswered = (plan: AnswerInputs) =>
  PROFILE_ENTRIES.filter((entry) => answerOf(plan, entry) != null).length

export const isProfileComplete = (plan: AnswerInputs) => profileAnswered(plan) === PROFILE_QUESTIONS

export const profilePercent = (plan: AnswerInputs) =>
  Math.round((profileAnswered(plan) / PROFILE_QUESTIONS) * 100)

/** How many of the questions first asked in the profile are answered. */
export const deeperAnswered = (plan: AnswerInputs) => NEW_QUESTIONS.length - questionsLeft(plan)
