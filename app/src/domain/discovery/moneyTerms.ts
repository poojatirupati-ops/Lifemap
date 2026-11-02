// The customer's own money terms, grouped by profile section (reveal, Me profile, report).
import type { ProfileAnswers } from './profile.ts'
import {
  APPETITE_QUESTION,
  SURPRISE_QUESTION,
  discoverQuestion,
  moneyQuestion,
} from './questions.data.ts'
import type { ProfileSection } from './terms.data.ts'

export interface TermGroup {
  section: ProfileSection
  terms: string[]
}

/** Each section's Discover answer tags, then its money-profile traits. */
const SECTIONS: [section: ProfileSection, discoverIds: string[], traitIds: string[]][] = [
  ['mindset', ['2', '12'], []],
  ['behaviour', ['4', '9'], ['u4', 'u11']],
  ['appetite', [APPETITE_QUESTION], []],
  ['safety', [SURPRISE_QUESTION], []],
  ['capacity', ['6'], []],
]

export const answerTag = (answers: ProfileAnswers['discover'], id: string) => {
  const index = answers[id]
  return index == null ? null : (discoverQuestion(id)?.options[index]?.tag ?? null)
}

const trait = (answers: ProfileAnswers['money'], id: string) => {
  const index = answers[id]
  return index == null ? null : (moneyQuestion(id)?.options[index]?.trait ?? null)
}

export function moneyTerms({ discover, money }: ProfileAnswers): TermGroup[] {
  return SECTIONS.map(([section, discoverIds, traitIds]) => ({
    section,
    terms: [
      ...discoverIds.map((id) => answerTag(discover, id)),
      ...traitIds.map((id) => trait(money, id)),
    ].filter((term): term is string => !!term),
  })).filter((group) => group.terms.length > 0)
}
