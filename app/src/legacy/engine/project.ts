// Projection engine: the prototype's project() as a generator (spec sec 19.8, 27, 29). Pure: no react, storage or network.
// One YearRow per calendar year (age = year - birth year; every age event applies to the whole year it is reached, retire.ts).
// Start year 2027 moves the calendar only: the Budget 2027 tax rules are not applied until final (sec 17, 23).
// A plan missing a required choice is 'blocked': nothing is projected and no figure is invented (sec 27.4).
import { assume } from './assume.ts'
import { ageInYear, type Dob } from './dates.ts'
import { amortYear } from './finance.ts'
import { finNums, goalsOf, iAPR, missingChoices, ownDob, years0 } from './finNums.ts'
import { fundedGoals, initGoals, need, saveRules, summarise, type Cov, type GS } from './goalFund.ts'
import { deflate, hhTax, type P } from './hhTax.ts'
import { incomeYear } from './incomeYear.ts'
import { RI } from './rates.ts'
import { WK, openPots } from './wealth.ts'
import { retireYears } from './retire.ts'
import { prsiRate } from './tax.ts'
import type { DueGoal, Result, Summary, WhatIf, YearRow } from './projectTypes.ts'
import type { Plan } from '../state/types.ts'

export { missingChoices } from './finNums.ts'
export type { DueGoal, GoalOut, Missing, Result, Summary, WhatIf, YearRow } from './projectTypes.ts'

/** Yields one row per calendar year; returns the results summary. Yields nothing when a required choice is missing (see projectAll). */
export function* projectYears(plan: Plan, wi: WhatIf = {}): Generator<YearRow, Summary | undefined> {
  if (missingChoices(plan).length) return undefined
  const year0 = years0(plan), dob = ownDob(plan, year0) as Dob, A = assume(plan), a0 = ageInYear(dob, year0)
  const R = plan.retireAge as number, end = plan.planUntil as number, N = end - a0
  const f = finNums(plan, A, a0, year0)
  const wg = wi.g != null ? plan.goals.find(g => g.id === wi.g) : undefined, wm = +(wi.m ?? 0) || 0, wl = +(wi.l ?? 0) || 0, wgR = wg?.kind === 'retire'
  const all = goalsOf(plan, f, A, a0), rg = all.find(g => g.kind === 'retire')
  const fg = fundedGoals(all, plan.rank, a0, end), save = saveRules(A, plan.ans['6'], wi), G = initGoals(fg, f, A, a0, N)
  // 1. Opening pots: goals' saved-so-far, buffer, then free money (wealth.ts)
  const op = openPots(fg, G, f, A, f.pension, wg, wgR, wl), { W, wTot, wTake, wAdd } = op
  let pen = op.pen, buffer = op.buffer, mBal = f.mortBal, cBal = f.cardBal, lBal = f.loanBal, mfreeDone = false
  const gf: Cov = {}
  for (const g of all) gf[g.id] = { cost: 0, cov: 0 }
  const person = { dob, retireAge: R, planUntil: end, scheme50: A.accessAge === 50 }, V = Math.max(R, A.accessAge)
  const penExtraM = +(plan.penExtra || 0)
  let auto0 = 0, s0: YearRow | undefined, retShort = false
  for (const y of retireYears(person, year0)) {
    const t = y.year - year0, a = y.age, yr = y.year, working = y.working
    const infl = Math.pow(1 + A.infl, t), wgw = Math.pow(1 + A.wage, t), tI = A.flatBands ? 1 : infl, rate = prsiRate(yr)
    const spI = A.spGrow === 'pay' ? wgw : A.spGrow === 'flat' ? 1 : infl
    const inc = incomeYear({ f, A, y, t, infl, wgw, tI, spI, penExtraM, wgR, wm, V, end }, pen)
    const { p1, p2, cashOut } = inc
    pen = inc.pen; if (inc.lumpNet) wAdd(inc.lumpNet)
    const rent = f.rentCred && yr <= RI.it.rentLastYear
    const tax = hhTax(deflate(p1, tI) as P, deflate(p2, tI), { married: f.married, spccc: f.spccc, rent, carer: f.carer, rate })
    const gross = p1.emp + p1.sp + p1.draw + p1.other + (p2 ? p2.emp + p2.sp : 0)
    const inflow = gross - tax * tI - cashOut
    const living = (working ? f.costsM * 12 : rg ? rg.amount : f.costsM * 12 * A.retireSpend) * infl + f.oneOffY * infl
    // a policy that pays out, and downsizing the home (only if the customer chose it)
    let polIn = 0, downIn = 0
    if (f.polLump > 0 && f.polLumpAge > 0 && a === f.polLumpAge) { W.cash += f.polLump; polIn = f.polLump }
    if (f.homeUse === "Yes, I'd downsize" && f.downAge > 0 && a === f.downAge && f.homeVal > 0) {
      downIn = Math.max(0, Math.max(0, f.homeVal - f.downValue) * infl * 0.9 - mBal)
      mBal = 0; mfreeDone = true; W.cash += downIn
    }
    let fixed = 0
    if (mBal > 1 && !mfreeDone) { const d = amortYear(mBal, f.mortRate, f.mortPayM); fixed += d.paid; mBal = d.bal }
    if (cBal > 1) { const d = amortYear(cBal, 0, f.cardPayM, iAPR(f.cardRate)); fixed += d.paid; cBal = d.bal }
    if (lBal > 1) { const d = amortYear(lBal, 0, f.loanPayM, iAPR(f.loanRate)); fixed += d.paid; lBal = d.bal }
    // 2. Goals due this year are paid from their own pot, then from unallocated money. What can't be paid is a goal gap.
    let goalPaid = 0, goalGap = 0, goalCost = 0
    const due: string[] = [], dueG: DueGoal[] = []
    for (const g of fg) {
      const x = G[g.id]
      if (x.done || g.age > a) continue
      x.done = true; due.push(g.name)
      if (g.kind === 'pot') {
        x.paid = Math.min(x.cost, x.pot); goalGap += x.cost - x.paid
        if (g.k === 'safety') buffer += x.pot; else wAdd(x.pot)   // the emergency fund stays as the buffer; a wealth pot becomes free money
        x.pot = 0
      } else {
        let pay = Math.min(x.cost, x.pot)
        x.pot -= pay; pay += wTake(x.cost - pay, x.srcDue); wAdd(x.pot); x.pot = 0
        x.paid = pay; goalPaid += pay; goalGap += x.cost - pay
        if (g.kind === 'mfree' && pay >= x.cost - 1) { mfreeDone = true; mBal = 0 } else if (g.kind === 'mfree') mBal = Math.max(0, mBal - pay)
      }
      gf[g.id].cost = x.cost; gf[g.id].cov = x.paid; goalCost += x.cost
      dueG.push({ id: g.id, name: g.name, e: g.e, kind: g.kind, cost: x.cost, paid: x.paid })
    }
    // 3. Spare money this year: only the saving amount is saved, the rest is assumed spent.
    const net = inflow - living - fixed
    let used = 0, short = 0, saved = 0, spent = 0
    if (t === 0) auto0 = save.auto(Math.max(0, net) / 12)
    const nd = (x: GS, n: number) => need(x, n, A.wage)
    if (net >= 0) {
      const less = !wgR && wm < 0 && working ? wm * 12 * infl : 0   // "saving less" lowers the saving amount
      let budget = Math.max(0, (working ? save.cap(net / 12 / infl, auto0) * 12 * infl : 0) + less)
      const extra = !wgR && wm > 0 && working && wg && G[wg.id] && !G[wg.id].done ? wm * 12 * infl : 0   // "extra towards X" (today's money, kept level in real terms)
      budget = Math.min(budget, net)
      const ex = Math.min(extra, net - budget)
      saved = budget + ex; spent = net - saved
      if (ex > 0 && wg) {
        const x = G[wg.id], give = Math.min(ex, nd(x, x.g.age - a))
        x.pot += give; x.cSum += give / infl; wAdd(ex - give); if (t === 0) x.c0 += give
      }
      for (const g of fg) {
        const x = G[g.id]
        if (x.done) continue
        const want = nd(x, g.age - a), give = Math.min(budget, want)
        if (t === 0) x.need0 = want
        x.pot += give; budget -= give; x.cSum += give / infl; x.payN += give; x.cYrs++; if (t === 0) x.c0 += give
      }
      wAdd(budget)   // saved but not needed by any goal: unallocated
      if (!working) { wAdd(spent); saved += spent; spent = 0 }   // retired income above the spending goal stays in savings
    } else {
      for (const g of fg) { const x = G[g.id]; if (!x.done) { x.cYrs++; if (t === 0) x.need0 = nd(x, g.age - a) } }
      let gap = -net
      const take = (v: number) => { const d = Math.min(gap, v); gap -= d; used += d; return d }
      for (const k of WK) W[k] -= take(Math.max(0, W[k]))
      buffer -= take(buffer)
      for (const g of fg.slice().reverse()) { const x = G[g.id]; if (!x.done && gap > 0) x.pot -= take(x.pot) }   // Nice-to-have and latest goals give way first
      short = gap
    }
    // 4. Growth
    op.grow(); buffer *= 1 + A.cash
    for (const g of fg) { const x = G[g.id]; if (!x.done) x.pot *= 1 + x.r }
    if (rg && !working) { gf[rg.id].cost += living; gf[rg.id].cov += living - Math.min(short, living) }
    const liquid = wTot() + buffer + fg.reduce((s, g) => s + G[g.id].pot, 0)
    for (const g of all) if (g.kind === 'legacy' && t === N) { const tgt = g.amount * infl; gf[g.id].cost = tgt; gf[g.id].cov = Math.min(tgt, wTot() + buffer) }
    const row: YearRow = {
      t, age: a, year: yr, inflow, needs: living + fixed, goalPaid, living, fixed, goalCost, dueG, short: short + goalGap, shortLiving: short, goalGap,
      due, used, saved, spent, liquid, pen, retired: !working, rmark: a === R, tax: tax * tI, gross, polIn, downIn,
    }
    if (t === 0) s0 = row
    if (row.retired && short > Math.max(500, row.needs * 0.02)) retShort = true
    yield row
  }
  // 5. Results
  const { pct, goal } = summarise(all, fg, gf, G)
  const goalShortAt = fg.filter(g => pct[g.id] < 95 && g.age - a0 >= 0 && g.age - a0 <= N).map(g => g.age - a0)
  if (rg && retShort) pct[rg.id] = Math.min(pct[rg.id], 94)
  const sur0 = s0 && a0 < R ? (s0.saved + s0.spent) / 12 : 0
  return { pct, goal, goalShortAt, save: { surplusM: Math.round(sur0), saveM: Math.round((s0?.saved ?? 0) / 12), autoM: auto0 } }
}

/** All rows plus results, or the list of required choices still missing. */
export function projectAll(plan: Plan, wi: WhatIf = {}): Result {
  const missing = missingChoices(plan)
  if (missing.length) return { blocked: true, missing }
  const rows: YearRow[] = [], it = projectYears(plan, wi)
  let r = it.next()
  while (!r.done) { rows.push(r.value); r = it.next() }
  const s = r.value as Summary
  for (const t of s.goalShortAt) rows[t].goalShort = true
  return { blocked: false, rows, ...s }
}
