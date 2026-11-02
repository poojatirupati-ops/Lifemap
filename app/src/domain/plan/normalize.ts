// The derived fields the original refreshed before every render, in its order: ages, list totals, the emergency fund (added, then sized).
import { assumption } from '../planning/assumptions.ts'
import { emergencyFundToAdd, safetyAmount } from '../goals/goals.ts'
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

/** The original's autoSafety, run before every projection: an emergency fund joins a plan whose cash is short (or that asked for one). */
export function addEmergencyFund(plan: Plan) {
  const fund = emergencyFundToAdd(plan, plan.nextGoalId)
  if (!fund) return
  plan.goals.push(fund)
  plan.nextGoalId++
}

/** Mutates the plan (an immer draft). */
export function normalize(plan: Plan, today = localToday()) {
  syncAges(plan, today)
  syncTotals(plan, assumption(plan, 'ownShare'))
  addEmergencyFund(plan)
  syncSafety(plan)
}
