import { assumption, type AssumptionInputs } from '../domain/planning/assumptions.ts'
import { taxSnapshot } from '../domain/planning/taxRegister.ts'
import type { Plan } from './types.ts'

/** The original's fixed "today" on version notes. */
const TODAY = '29 Sep 2026'

/** The note the next plan save sends as its `snapshot`, so the server keeps that save as a version. */
let pending: string | undefined

/** Keep a version of the plan in its history, e.g. "Goals changed", with the tax rules it used. */
export function addVersion(plan: Pick<Plan, 'versions'> & AssumptionInputs, note: string) {
  plan.versions.push({ note, date: TODAY, tax: taxSnapshot(assumption(plan, 'startYear')) })
  pending = note // several versions between two saves send only the latest note
}

/** The pending snapshot note, cleared once read. */
export function takeSnapshot() {
  const note = pending
  pending = undefined
  return note
}
