// Honest goal funding: the order goals are funded in, how much is saved, and the money they draw on.
import type { Goal } from '../../state/types'
import type { Holding } from './wallet'

/** Goals paid from savings; retirement uses the pension and cashflow, a legacy is what is left. */
export const SAVED_FOR_KINDS = ['spend', 'mfree', 'pot']

// Q6 answer -> monthly saving cap, today's money ("Over €750" -> €1,000; "It changes" -> a share)
const SAVING_BANDS = [50, 200, 500, 1000]
const VARIES = 4
const VARIES_SHARE = 0.33

export interface SavingRules {
  /** at most this share of spare money is saved */
  share: number
  /** monthly cap when the customer has not said what they could save */
  noAnswer: number
}

export interface SavingChoice {
  /** what the customer could save (Q6 answer) */
  answer?: number
  /** "My monthly saving", today's money */
  saveM: number | null
  /** fixed once the customer moves the control, so a later income change can't flip it */
  saveUp?: boolean | null
}

export const isSafety = (goal: Goal) => goal.k === 'safety'

// Emergency fund first, then Must have before Nice to have, then soonest
const byDefault = (a: Goal, b: Goal) =>
  Number(!isSafety(a)) - Number(!isSafety(b)) ||
  Number(a.prio === 'Nice to have') - Number(b.prio === 'Nice to have') ||
  a.age - b.age ||
  a.id - b.id

/** The customer's ranking first; unranked goals after it, in the default order. */
export function fundingOrder<G extends Goal>(goals: G[], rank: number[] | null) {
  const position = (goal: Goal) => {
    const index = rank?.indexOf(goal.id) ?? -1
    if (index >= 0) return index
    return isSafety(goal) ? -1 : 1e6
  }
  return [...goals].sort((a, b) => (rank ? position(a) - position(b) : 0) || byDefault(a, b))
}

/** The Q6 rule: monthly saving from spare money, today's money. */
export function ruleSaving(spareMonthly: number, answer: number | undefined, rules: SavingRules) {
  const spare = Math.max(0, spareMonthly)
  if (answer === VARIES) return VARIES_SHARE * spare
  const cap = answer == null ? rules.noAnswer : SAVING_BANDS[answer]
  return Math.min(cap, rules.share * spare)
}

/** The customer's own saving: raising it keeps the rule's later growth, lowering it caps every year. */
export function savingCap(
  spareMonthly: number,
  ruleToday: number,
  choice: SavingChoice,
  rules: SavingRules,
) {
  const spare = Math.max(0, spareMonthly)
  const rule = ruleSaving(spare, choice.answer, rules)
  if (choice.saveM == null) return rule
  const raised = choice.saveUp ?? choice.saveM >= ruleToday - 0.5
  return Math.min(spare, raised ? Math.max(choice.saveM, rule) : Math.min(choice.saveM, rule))
}

/** Value after some years of 1 a year saved at the start of each year, rising with pay. */
export function savedGrowth(years: number, rate: number, payRise: number) {
  let total = 0
  for (let year = 0; year < years; year++)
    total += (1 + payRise) ** year * (1 + rate) ** (years - year)
  return total
}

/** Money taken from each holding, after tax. */
export type Sources = Partial<Record<Holding, number>>

/** One goal's savings pot through the plan. */
export interface GoalPot {
  /** with its age moved inside the plan */
  goal: Goal
  years: number
  rate: number
  cost: number
  pot: number
  paid: number
  done: boolean
  savedSoFar: number
  savedFirstYear: number
  /** saved from spare money, in today's money */
  savedReal: number
  savedFromSpare: number
  yearsSaving: number
  neededFirstYear: number
  fromAssets: Sources
  fromAssetsWhenDue: Sources
}

export const newPot = (goal: Goal, years: number, rate: number, cost: number): GoalPot => ({
  goal,
  years,
  rate,
  cost,
  pot: 0,
  paid: 0,
  done: false,
  savedSoFar: 0,
  savedFirstYear: 0,
  savedReal: 0,
  savedFromSpare: 0,
  yearsSaving: 0,
  neededFirstYear: 0,
  fromAssets: {},
  fromAssetsWhenDue: {},
})

/** Yearly saving (rising with pay) that still reaches the cost. */
export const yearlyNeed = (pot: GoalPot, years: number, payRise: number) =>
  Math.max(
    0,
    (pot.cost - pot.pot * (1 + pot.rate) ** years) / savedGrowth(years, pot.rate, payRise),
  )

/** Rounded down, so 99.6% never reads as 100%. */
export function coveredPercent(cost: number, covered: number) {
  if (cost <= 0 || covered >= cost - 1) return 100
  return Math.min(99, Math.max(0, Math.floor((covered / cost) * 100)))
}

export const goalFunding = (pot: GoalPot) => ({
  cost: pot.cost,
  have: pot.paid,
  rate: pot.rate,
  years: pot.years,
  savedSoFar: pot.savedSoFar,
  fromAssets: pot.fromAssets,
  fromAssetsWhenDue: pot.fromAssetsWhenDue,
  savedFromSpare: pot.savedFromSpare,
  gap: Math.max(0, pot.cost - pot.paid),
  neededMonthly: Math.round(pot.neededFirstYear / 12),
  savingMonthly: Math.round(pot.savedFirstYear / 12),
  averageMonthly: pot.yearsSaving ? Math.round(pot.savedReal / pot.yearsSaving / 12) : 0,
})

export type GoalFunding = ReturnType<typeof goalFunding>
