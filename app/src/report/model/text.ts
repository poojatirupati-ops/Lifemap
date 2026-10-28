// Small wordings the report pages share.
import { euro } from '../../lib/format.ts'
import type { Band } from './context.ts'

/** €950, €12,500, €48k, €1.2m (thousands only from €10,000) */
export function shortEuro(amount: number) {
  const value = Math.abs(amount)
  if (value >= 1e6) return `€${+(value / 1e6).toFixed(1)}m`
  if (value >= 1e4) return `€${Math.round(value / 1e3)}k`
  return `€${Math.round(value).toLocaleString('en-IE')}`
}

export const bandTone = (band: Band) =>
  band === 'good' ? 'good' : band === 'nudge' ? 'gold' : 'coral'
export const bandKey = (band: Band) => (band === 'nudge' ? 'gold' : band)
export const bandText = (band: Band) =>
  band === 'good' ? 'On track' : band === 'nudge' ? 'Nearly there' : 'Needs attention'

export const plural = (count: number, one: string, many: string) => (count === 1 ? one : many)

/** "Age 45 · 2046 · €20,000", "From 65 · 2066 · €30,000 a year" */
export function goalMeta(goal: { kind: string; age: number; amount: number }, year: number) {
  if (goal.kind === 'retire') return `From ${goal.age} · ${year} · ${euro(goal.amount)} a year`
  if (goal.kind === 'legacy') return `At the end of the plan · ${year} · ${euro(goal.amount)}`
  return `Age ${goal.age} · ${year} · ${euro(goal.amount)}`
}
