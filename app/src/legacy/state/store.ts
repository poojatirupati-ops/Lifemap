import { useSyncExternalStore } from 'react'
import { KEY_V1, migrate } from './migrate.ts'
import { defaultPlan, type Plan } from './types.ts'

export const KEY = 'lifemap.plan.v2'   // bump the suffix when Plan changes shape

function load(): Plan {
  try {
    const v2 = localStorage.getItem(KEY)
    const v1 = v2 === null ? localStorage.getItem(KEY_V1) : null
    const raw = v2 ?? v1
    return migrate(raw ? JSON.parse(raw) : null, v2 === null ? 1 : 2)
  } catch {
    return defaultPlan()
  }
}

let plan = load()
const listeners = new Set<() => void>()

export const getPlan = () => plan

export function setPlan(patch: Partial<Plan>) {
  plan = { ...plan, ...patch }
  try { localStorage.setItem(KEY, JSON.stringify(plan)) } catch { /* private mode or full: keep in memory */ }
  listeners.forEach(l => l())
}

/** Test helper: drop memory and re-read storage (what a page reload does). */
export function reload() {
  plan = load()
  listeners.forEach(l => l())
}

export function usePlan(): Plan {
  return useSyncExternalStore(l => (listeners.add(l), () => { listeners.delete(l) }), getPlan)
}
