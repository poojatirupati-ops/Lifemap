// The derived fields the original refreshed before every render, in its order: ages, list totals, the emergency fund.
import { assumption } from '../planning/assumptions.ts'
import { safetyAmount } from '../goals/goals.ts'
import { agesFromDob } from '../identity/dob.ts'
import { localToday } from '../../lib/today.ts'
import { syncTotals } from '../finances/syncTotals.ts'
import type { Goal, Plan } from '../../state/types.ts'

export function syncAges(plan: Plan, today = localToday()) {
  agesFromDob(plan, { startYear: assumption(plan, 'startYear'), today })
}

// an auto emergency fund goal is months x essential spending once the customer's costs are in
export function syncSafety(plan: Plan, only?: Goal) {
  if (!plan.sources?.costsM) return
  const goals = only ? [only] : plan.goals.filter((goal) => goal.key === 'safety' && goal.auto)
  for (const goal of goals) goal.amount = safetyAmount(plan)
}

/** Mutates the plan (an immer draft). */
export function normalize(plan: Plan, today = localToday()) {
  syncAges(plan, today)
  syncTotals(plan, assumption(plan, 'ownShare'))
  syncSafety(plan)
}
