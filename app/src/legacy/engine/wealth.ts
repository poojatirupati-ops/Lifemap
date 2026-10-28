// The money pots of a projection and the opening allocation of today's cash to goals. Pure.
import type { A } from './assume.ts'
import { essM, type F } from './finNums.ts'
import type { GS } from './goalFund.ts'
import { RI } from './rates.ts'
import type { Goal } from '../state/types.ts'

export const WK = ['cash', 'sav', 'inv', 'oth', 'alt']

/** Unallocated money in pots, used in WK order. */
export function makePots(cash: number, f: F, A: A) {
  const W: Record<string, number> = { cash, sav: f.savings, inv: f.invest, oth: f.otherAssets, alt: f.altInv }
  const cgtEff = RI.sav.cgt * A.cgtGain, WCG: Record<string, number> = { oth: cgtEff, alt: cgtEff }   // tax on the gain share when other assets are sold (annual exemption not counted: prudent)
  const wTot = () => W.cash + W.sav + W.inv + W.oth + W.alt
  const wTake = (amt: number, src?: Record<string, number>, keys: string[] = WK) => {
    let need = Math.max(0, amt), got = 0
    for (const k of keys) {
      const e = WCG[k] ?? 0, d = Math.min(need, Math.max(0, W[k]) * (1 - e))
      if (d > 0) { W[k] -= d / (1 - e); need -= d; got += d; if (src) src[k] = (src[k] ?? 0) + d }
    }
    return got
  }
  const wAdd = (v: number) => { W.cash += v * (1 - A.investShare); W.inv += v * A.investShare }
  const grow = () => { W.cash *= 1 + A.cash; W.sav *= 1 + A.cash; W.inv *= 1 + A.inv; W.oth *= 1 + A.infl; W.alt *= 1 + A.inv }
  return { W, wTot, wTake, wAdd, grow }
}

/** Lump sums: each goal's own "saved so far" (from cash), a buffer held back, then free money in goal order. Returns the pots, the buffer and the pension fund after a what-if lump. */
export function openPots(fg: Goal[], G: Record<number, GS>, f: F, A: A, pen: number, wg: Goal | undefined, wgR: boolean, wl: number) {
  let cash = f.cash
  for (const g of fg) { const s = Math.min(g.saved || 0, cash); G[g.id].pot += s; G[g.id].saved0 = s; cash -= s }
  if (wg && !wgR && G[wg.id]) G[wg.id].pot += wl
  if (wgR) pen += wl
  const buffer = fg.some(g => g.k === 'safety') ? 0 : Math.min(cash, A.buffer * essM(f))
  const p = makePots(cash - buffer, f, A)
  for (const g of fg) {   // the emergency fund is built from cash and savings accounts only
    const x = G[g.id], want = Math.max(0, x.cost / Math.pow(1 + x.r, x.n) - x.pot)
    x.pot += p.wTake(want, x.src0, g.k === 'safety' ? ['cash', 'sav'] : WK)
  }
  return { ...p, buffer, pen }
}
