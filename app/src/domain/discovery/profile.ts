// Money personality and the horizon suggestion (FP review round 1 §2).
import { PERSONALITY_TYPES } from '../identity/personality.data.ts'
import type { Goal } from '../../state/types.ts'
import { DISCOVER_SIX, MONEY_PROFILE, type Option } from './questions.data.ts'
import { PERSONALITY_TIE_ORDER, PERSONALITY_WEIGHTS, type PersonalityCode } from './profile.data.ts'

/** Answers are option indexes by question id. */
export type Answers = Record<string, number>

export interface ProfileAnswers {
  discover: Answers
  /** Understand Me */
  money: Answers
  /** products the customer has held (the chips under u11) */
  products: string[]
}

/** The score (1 most cautious to 4) of the chosen option. */
export const optionScore = (
  question: { options: Option[] } | undefined,
  index: number | undefined,
) => (index == null ? null : (question?.options[index]?.score ?? null))

const MIN_DISCOVER_ANSWERS = 4

export const discoverAnswered = (answers: Answers) =>
  DISCOVER_SIX.filter((q) => answers[q.id] != null).length

export const hasEnoughForPersonality = (answers: Answers) =>
  discoverAnswered(answers) >= MIN_DISCOVER_ANSWERS

export const moneyProfileAnswered = ({ discover, money }: ProfileAnswers) =>
  MONEY_PROFILE.flatMap((step) => step.questions).filter((q) =>
    typeof q === 'string' ? discover[q] != null : money[q.id] != null,
  ).length

const chosenWeights = (answers: ProfileAnswers, id: string) => {
  const index = (id === 'u4' ? answers.money : answers.discover)[id]
  return index == null ? null : PERSONALITY_WEIGHTS[id][index]
}

/** Needs four of the six Discover answers: never guess a type. */
export function personality(answers: ProfileAnswers) {
  if (!hasEnoughForPersonality(answers.discover)) return null
  const totals: Record<PersonalityCode, number> = { A: 0, B: 0, E: 0, C: 0 }
  for (const id of Object.keys(PERSONALITY_WEIGHTS)) {
    for (const [code, weight] of Object.entries(chosenWeights(answers, id) ?? {})) {
      totals[code as PersonalityCode] += weight
    }
  }
  const top = Math.max(...Object.values(totals))
  const tied = PERSONALITY_TIE_ORDER.filter((code) => totals[code] === top)
  return PERSONALITY_TYPES[breakTie(answers, tied)]
}

// Q2 decides a tie, else Q4 when it points to one of the tied types only, else the tie order.
function breakTie(answers: ProfileAnswers, tied: PersonalityCode[]) {
  if (tied.length === 1) return tied[0]
  const pointsTo = (id: string) => tied.filter((code) => chosenWeights(answers, id)?.[code] != null)
  const fromQuestion2 = pointsTo('2')
  if (fromQuestion2.length > 0) return fromQuestion2[0]
  const fromQuestion4 = pointsTo('4')
  return fromQuestion4.length === 1 ? fromQuestion4[0] : tied[0]
}

/** The horizon (u9 option 0 to 3) the goals suggest; pension money is used for decades after retiring. */
export function suggestedHorizon(
  goals: Pick<Goal, 'kind' | 'age' | 'saved'>[],
  age: number,
  retireAge: number,
) {
  const later = goals.filter((g) => g.age - age > 2).sort((a, b) => a.age - b.age)
  const goal =
    later.find((g) => g.kind === 'pot') ?? later.find((g) => g.kind !== 'retire' && !(g.saved > 0))
  const years = goal ? goal.age - age : retireAge - age + 10
  if (years <= 2) return 0
  if (years <= 5) return 1
  if (years <= 10) return 2
  return 3
}
