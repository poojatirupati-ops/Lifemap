// Goal funding helpers for the projection: which goals are funded and in what order, each goal's state, the saving rule, and the results summary. Pure.
import type { A } from './assume.ts'
import { amortYear, clamp } from './finance.ts'
import { SAVE } from './assumptions.ts'
import type { F } from './finNums.ts'
import type { Goal } from '../state/types.ts'

/** What-if: g = goal id, m = extra (or less, if negative) a month towards it, l = lump sum now; saveM/saveUp = the customer's own monthly saving (today's money). */
export type WhatIf = { g?: number | null; m?: number; l?: number; saveM?: number | null; saveUp?: boolean }
export type GoalOut = {
  cost: number; have: number; rate: number; years: number; saved0: number; src0: Record<string, number>; srcDue: Record<string, number>
  payN: number; gap: number; needM: number; nowM: number; avgM: number
}
export type GS = {
  g: Goal; n: number; r: number; cost: number; pot: number; paid: number; done: boolean; c0: number; cSum: number; cYrs: number
  need0: number; saved0: number; src0: Record<string, number>; srcDue: Record<string, number>; payN: number
}
export type Cov = Record<number, { cost: number; cov: number }>

export const annF = (n: number, r: number, w: number) => { let s = 0; for (let t = 0; t < n; t++) s += Math.pow(1 + w, t) * Math.pow(1 + r, n - t); return s }
/** What a goal still needs a year, over n years, to reach its cost. */
export const need = (x: GS, n: number, wage: number) => Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, wage))

/** §19.8: funding follows the customer's ranking (Emergency fund first unless moved); unranked: Emergency fund, Must have before Nice to have, soonest. */
export function fundedGoals(all: Goal[], rank: number[] | null, a0: number, end: number): Goal[] {
  const idx = (g: Goal) => { const i = rank ? rank.indexOf(g.id) : -1; return i >= 0 ? i : g.k === 'safety' ? -1 : 1e6 }
  const safe = (g: Goal) => (g.k === 'safety' ? 0 : 1), nice = (g: Goal) => (g.prio === 'Nice to have' ? 1 : 0)
  const order = (a: Goal, b: Goal) => (rank ? idx(a) - idx(b) : 0) || safe(a) - safe(b) || nice(a) - nice(b) || a.age - b.age || a.id - b.id
  return all.filter(g => ['spend', 'mfree', 'pot'].includes(g.kind)).map(g => ({ ...g, age: clamp(g.age, a0 + 1, end) })).sort(order)
}

/** Each funded goal's state at the start: years to go, growth rate, inflated cost ("be mortgage-free" costs the mortgage balance at its date). */
export function initGoals(fg: Goal[], f: F, A: A, a0: number, N: number): Record<number, GS> {
  const mPath: number[] = []   // mortgage balance path
  for (let t = 0, m = f.mortBal; t <= N; t++) { mPath.push(Math.max(0, m)); if (m > 1) m = amortYear(m, f.mortRate, f.mortPayM).bal }
  const G: Record<number, GS> = {}
  for (const g of fg) {
    const n = Math.max(0, g.age - a0), r = n >= A.longYrs ? A.inv : A.cash
    const cost = g.kind === 'mfree' && f.mortBal > 0 ? mPath[Math.min(n + 1, N)] : g.amount * Math.pow(1 + A.infl, n)
    G[g.id] = { g, n, r, cost, pot: 0, paid: 0, done: false, c0: 0, cSum: 0, cYrs: 0, need0: 0, saved0: 0, src0: {}, srcDue: {}, payN: 0 }
  }
  return G
}

/** The monthly saving rule: auto (from the answer to question 6) and the what-if cap on it. */
export function saveRules(A: A, ans6: number | undefined, wi: WhatIf) {
  const auto = (surplusM: number) => { const sp = Math.max(0, surplusM); return ans6 === 4 ? 0.33 * sp : Math.min(typeof ans6 === 'number' ? SAVE.band[ans6] ?? A.noAnswer : A.noAnswer, A.share * sp) }
  const cap = (surplusM: number, auto0: number) => {
    const sp = Math.max(0, surplusM), a = auto(sp), s = wi.saveM
    if (s == null) return a
    return Math.min(sp, (wi.saveUp ?? s >= auto0 - 0.5) ? Math.max(s, a) : Math.min(s, a))   // raising keeps the rule's later growth; lowering caps every year
  }
  return { auto, cap }
}

/** Results: percent of each goal covered (floored, so 99.6% never reads as 100%) and the per-goal figures. */
export function summarise(all: Goal[], fg: Goal[], gf: Cov, G: Record<number, GS>) {
  const pct: Record<number, number> = {}, goal: Record<number, GoalOut> = {}
  for (const g of all) { const x = gf[g.id]; pct[g.id] = x.cost > 0 ? (x.cov >= x.cost - 1 ? 100 : clamp(Math.floor((x.cov / x.cost) * 100), 0, 99)) : 100 }
  for (const g of fg) {
    const x = G[g.id]
    goal[g.id] = {
      cost: x.cost, have: x.paid, rate: x.r, years: x.n, saved0: x.saved0, src0: x.src0, srcDue: x.srcDue, payN: x.payN, gap: Math.max(0, x.cost - x.paid),
      needM: Math.round(x.need0 / 12), nowM: Math.round(x.c0 / 12), avgM: x.cYrs ? Math.round(x.cSum / x.cYrs / 12) : 0,
    }
  }
  return { pct, goal }
}
