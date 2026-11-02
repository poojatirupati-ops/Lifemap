// The goal catalogue the customer picks from, as in the original.
import { REASONS } from '../identity/personality.data.ts'

export type GoalKind = 'spend' | 'retire' | 'pot' | 'mfree' | 'legacy'

export interface GoalCategory {
  key: string
  title: string
  emoji: string
  amount: number
  /** how many years from now, by default; retirement and legacy have their own age */
  years: number | null
  kind: GoalKind
  /** the expert who helps with it */
  specialist: string
}

export interface OtherGoal {
  emoji: string
  name: string
  amount: number
  years: number
}

/** Goals suggested for an age; retirement comes first from 45, never pre-selected. */
export function suggestedGoals(age: number) {
  if (age < 35) return ['safety', 'home', 'wealth']
  if (age < 45) return ['family', 'edu', 'home']
  if (age < 55) return ['retire', 'mfree']
  return ['retire', 'legacy', 'helpfam']
}

type Row = [
  key: string,
  title: string,
  emoji: string,
  amount: number,
  years: number | null,
  kind: GoalKind,
  specialist: string,
]

const ROWS: Row[] = [
  ['home', 'Buy a home', '🏡', 40000, 4, 'spend', 'mortgage'],
  ['retire', 'Retire comfortably', '🌅', 40000, null, 'retire', 'pension'],
  ['family', 'Grow my family', '👶', 15000, 3, 'spend', 'protection'],
  ['edu', "Kids' education", '🎓', 30000, 10, 'spend', 'planner'],
  ['travel', 'Travel', '✈️', 8000, 2, 'spend', 'planner'],
  ['business', 'Start a business', '💼', 25000, 5, 'spend', 'planner'],
  ['mfree', 'Be mortgage-free', '🏦', 150000, 15, 'mfree', 'mortgage'],
  ['safety', 'Emergency fund', '🪂', 15000, 2, 'pot', 'planner'],
  ['wealth', 'Grow my wealth', '📈', 50000, 10, 'pot', 'investment'],
  ['helpfam', 'Help my family', '🤝', 20000, 8, 'spend', 'planner'],
  ['legacy', 'Leave a legacy', '🎁', 100000, null, 'legacy', 'planner'],
  ['wedding', 'Wedding', '💍', 25000, 3, 'spend', 'planner'],
  ['car', 'Change the car', '🚗', 30000, 3, 'spend', 'planner'],
  ['health', 'Health & care', '🩺', 10000, 5, 'spend', 'protection'],
  ['other', 'Something else', '⭐', 10000, 4, 'spend', 'planner'],
]

export const GOAL_CATEGORIES: GoalCategory[] = ROWS.map(
  ([key, title, emoji, amount, years, kind, specialist]) => ({
    key,
    title,
    emoji,
    amount,
    years,
    kind,
    specialist,
  }),
)

export const goalCategory = (key: string) => GOAL_CATEGORIES.find((c) => c.key === key)

/** Ideas offered under "Something else". */
export const OTHER_GOALS: OtherGoal[] = [
  { emoji: '🧳', name: 'Career break', amount: 15000, years: 5 },
  { emoji: '🌍', name: 'Moving abroad', amount: 20000, years: 4 },
  { emoji: '🏥', name: 'Long-term care', amount: 60000, years: 40 },
  { emoji: '📚', name: 'Fund a course', amount: 8000, years: 2 },
]

/** The picker's two groups: what brought them here first, then the goals for their life stage. */
export function goalPickerSections(why: string[], age: number) {
  const fromWhy = REASONS.filter((reason) => why.includes(reason.key)).flatMap((r) => r.goals ?? [])
  const suggested = [...new Set([...fromWhy, ...suggestedGoals(age)])]
  const more = GOAL_CATEGORIES.map((c) => c.key).filter((key) => !suggested.includes(key))
  return { suggested, more }
}
