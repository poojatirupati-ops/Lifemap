import type { Plan } from './types.ts'

/** The original's fixed "today" on version notes. */
const TODAY = '29 Sep 2026'

/** The note the next plan save sends as its `snapshot`, so the server keeps that save as a version. */
let pending: string | undefined

/** Keep a version of the plan in its history, e.g. "Goals changed". */
export function addVersion(plan: Pick<Plan, 'versions'>, note: string) {
  plan.versions.push({ note, date: TODAY })
  pending = note // ponytail: several versions between two saves keep only the latest note
}

/** The pending snapshot note, cleared once read. */
export function takeSnapshot() {
  const note = pending
  pending = undefined
  return note
}
