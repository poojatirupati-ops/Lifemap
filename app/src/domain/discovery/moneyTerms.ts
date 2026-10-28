// The customer's own money terms, grouped by profile section (reveal, Me profile, report).
import type { ProfileAnswers } from './profile.ts'
import { discoverQuestion, moneyQuestion } from './questions.data.ts'

export interface TermGroup {
  /** a key of PROFILE_SECTIONS */
  section: string
  terms: string[]
}

const SECTIONS: [section: string, discoverIds: string[]][] = [
  ['mindset', ['2', '12']],
  ['behaviour', ['4', '9']],
  ['appetite', ['8']],
  ['safety', ['7']],
  ['capacity', ['6']],
]

/** Behavioural traits from the money profile, shown with investor behaviour. */
const TRAIT_QUESTIONS = ['u4', 'u11']

export const answerTag = (answers: ProfileAnswers['discover'], id: string) => {
  const index = answers[id]
  return index == null ? null : (discoverQuestion(id)?.options[index]?.tag ?? null)
}

const trait = (answers: ProfileAnswers['money'], id: string) => {
  const index = answers[id]
  return index == null ? null : (moneyQuestion(id)?.options[index]?.trait ?? null)
}

export function moneyTerms({ discover, money }: ProfileAnswers): TermGroup[] {
  return SECTIONS.map(([section, ids]) => ({
    section,
    terms: [
      ...ids.map((id) => answerTag(discover, id)),
      ...(section === 'behaviour' ? TRAIT_QUESTIONS.map((id) => trait(money, id)) : []),
    ].filter((term): term is string => !!term),
  })).filter((group) => group.terms.length > 0)
}
