import type { Plan } from './types.ts'

/** The original's fixed "today" on version notes. */
const TODAY = '29 Sep 2026'

/** Keep a version of the plan in its history, e.g. "Goals changed". */
export function addVersion(plan: Pick<Plan, 'versions'>, note: string) {
  plan.versions.push({ note, date: TODAY })
}
