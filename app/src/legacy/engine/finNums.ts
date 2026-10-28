// The plan as numbers (finances, partner, debts) and the goals as funded. Pure; skipped figures count as 0 and are never filled in (sec 15).
import { ageInYear, parseDob, sampleDob, type Dob } from './dates.ts'
import type { A } from './assume.ts'
import type { Missing } from './projectTypes.ts'
import { pmtM } from './finance.ts'
import { RI } from './rates.ts'
import type { Goal, Plan } from '../state/types.ts'

type Fin = Plan['fin']
export const num = (f: Fin, k: string): number => { const v = f[k]; return v != null && v !== '' && !isNaN(+v) ? +v : 0 }
const has = (f: Fin, k: string) => f[k] != null && f[k] !== '' && !isNaN(+f[k])
export const years0 = (plan: Plan) => (plan.asm.startYear === 2027 ? 2027 : 2026)
export const ownDob = (plan: Plan, y0: number): Dob | undefined => (plan.dob ? parseDob(plan.dob) : plan.about.legacyAge != null ? sampleDob(plan.about.legacyAge, y0) : undefined)
export const partnerOn = (plan: Plan) => plan.about.partner === true
const partnerAge = (plan: Plan, y0: number, fallback: number) => {
  const d = plan.partnerDob ? parseDob(plan.partnerDob) : undefined
  return d ? ageInYear(d, y0) : num(plan.fin, 'pAge') || fallback
}
const spFrac = (y: number) => (y < RI.sp.minYears ? 0 : Math.min(1, y / RI.sp.fullYears))
export const iAPR = (apr: number) => Math.pow(1 + apr, 1 / 12) - 1   // APR is an effective yearly rate; mortgages use the nominal rate / 12
const mPmt = (bal: number, r: number, yrs: number) => pmtM(bal, r / 12, Math.max(1, Math.round(yrs * 12)))

export function finNums(plan: Plan, A: A, a0: number, year0: number) {
  const f = plan.fin, n = (k: string) => num(f, k), C = plan.about.cred ?? {}
  const wk = (f.work as string | undefined) || (n('income') > 0 ? 'Employed' : undefined)
  const mortOn = f.home === 'Own with mortgage', inc = wk === 'Not working' ? 0 : n('income')
  const mR = n('mortRate') > 0 ? n('mortRate') / 100 : A.mortRate, mStated = mortOn ? n('mortPayM') : 0
  const penM = wk !== 'Not working' && inc > 0 ? n('pensionM') : 0
  const own = has(f, 'pensionOwnM') ? Math.min(penM, +f.pensionOwnM) : penM * A.ownShare
  const yrsSP = has(f, 'spYears') ? +f.spYears : A.spYears
  const spF = yrsSP != null ? spFrac(yrsSP) : f.sp === 'Expect full' ? 1 : Math.min(1, A.spWeek / RI.sp.week)
  const partner = partnerOn(plan), pSpO = partner ? ((f.pSp as string) || 'Not sure') : 'None'
  const pSpPart = Math.min(1, A.pSpWeek / RI.sp.week)
  const pSp: number | 'qa' = ({ 'Own full': 1, 'Own partial': pSpPart, 'Not sure': pSpPart, 'Qualified adult increase': 'qa', None: 0 } as Record<string, number | 'qa'>)[pSpO] ?? 0
  const married = partner && plan.about.married === true
  // debts: cards and other loans (incl. other-property mortgages, sec 24.1) amortise at their APR; a stated repayment is used if it covers the interest, else a 5-year repayment
  let m2b = 0, m2p = 0, m2r = 0
  for (const it of plan.lists.mort2 ?? []) {
    const b = has(it.f, 'owed') ? +it.f.owed : 0
    if (!(b > 0)) continue
    const r = has(it.f, 'rate') && +it.f.rate > 0 ? +it.f.rate / 100 : A.mortRate
    m2b += b; m2r += b * r
    m2p += has(it.f, 'pay') && +it.f.pay > 0 ? +it.f.pay : mPmt(b, r, has(it.f, 'years') && +it.f.years > 0 ? +it.f.years : 25)
  }
  const m2rate = m2b > 0 ? m2r / m2b : 0, lR0 = n('loanRate') > 0 ? n('loanRate') / 100 : A.loanRate
  const lB0 = n('loanBal') + n('debt'), cR = n('cardRate') > 0 ? n('cardRate') / 100 : A.cardRate
  const lR = m2b > 0 ? (lB0 > 0 ? (lB0 * lR0 + m2b * m2rate) / (lB0 + m2b) : m2rate) : lR0
  const c = n('cardBal'), l = lB0 + m2b, lp = n('loanPayM') + n('debtPayM') + m2p, cp = n('cardPayM')
  const pay = (b: number, p: number, r: number) => (b > 0 && p > b * iAPR(r) ? p : pmtM(b, iAPR(r), 60))
  const cardPayM = c > 0 ? pay(c, cp, cR) : 0, loanPayM = l > 0 ? pay(l, lp, lR) : 0
  const mortBal = mortOn ? n('mortBal') : 0
  const mortPayM = mortOn ? mStated || mPmt(n('mortBal'), mR, n('mortYears') || 25) : 0
  const owns = /^Own/.test((f.home as string) || ''), penChg = has(f, 'penChg') ? +f.penChg / 100 : null
  return {
    age: a0, R: plan.retireAge as number, work: wk, married, partner, pAge: partner ? partnerAge(plan, year0, a0) : 0, pRet: plan.partnerRetireAge ?? 0,
    income: inc, pIncome: partner ? n('pIncome') : 0, otherM: n('otherM'), costsM: n('costsM'), oneOffY: n('oneOffY'),
    cash: n('cash'), invest: n('invest'), rentM: n('rentM'), savings: n('savings'), otherAssets: n('otherAssets'), altInv: n('altInv'),
    homeVal: owns ? n('homeValue') : 0, homeUse: owns ? (f.homeUse as string) || 'No, never' : 'No, never', downAge: n('downAge'), downValue: n('downValue'),
    polLump: n('polLump'), polLumpAge: n('polLumpAge'), polInc: n('polInc'), polIncAge: n('polIncAge'),
    mortBal, mortRate: mR, mortPayM, cardBal: c, cardRate: cR, cardPayM, loanBal: l, loanRate: lR, loanPayM, debt: c + l, debtPayM: cardPayM + loanPayM,
    pension: n('pension'), pensionM: penM, pensionOwnM: own, penG: penChg == null ? A.pen : A.pen + A.penChg - penChg, sp: spF, pSp,
    ae: wk === 'Employed' && a0 >= RI.ae.ageMin && a0 <= RI.ae.ageMax && inc > RI.ae.earnMin && penM === 0 && f.ae !== 'No',
    rentCred: !!C.rent && f.home === 'Rent', spccc: !!C.lone && (plan.about.deps ?? 0) > 0 && !partner, carer: !!C.carer && married,
  }
}
export type F = ReturnType<typeof finNums>
export const essM = (f: F) => f.costsM + f.mortPayM + (f.debt > 0 ? f.debtPayM : 0)   // essential spending a month

// Goals as funded: an unedited Emergency fund follows essential spending, and one is added when cash is below the target (v3.0). The plan store never gets this goal written back.
export function goalsOf(plan: Plan, f: F, A: A, a0: number): Goal[] {
  let gs = plan.goals
  const e = plan.src.costsM ? essM(f) : 0
  const wanted = plan.safetyWanted || (plan.src.cash && e > 0 && f.cash < A.buffer * e - 0.5)
  if (!gs.some(g => g.k === 'safety') && !plan.safetyOff && wanted)
    gs = [...gs, {
      id: plan.gid, k: 'safety', name: 'Emergency fund', e: '🪂', kind: 'pot', spec: 'planner', amount: e > 0 ? Math.round(e * A.buffer) : 15000, saved: 0,
      who: 'Me', prio: 'Must have', flex: 'Can move', age: Math.min(89, a0 + 2), auto: true, autoAdded: !plan.safetyWanted,
    }]
  return gs.map(g => (g.k === 'safety' && g.auto && plan.src.costsM ? { ...g, amount: Math.round(essM(f) * A.buffer) } : g))
}

/** The choices a plan must have before any result (sec 27.4); [] when the plan can be projected. A plan-until age at or below today's age leaves nothing to project, so it counts as missing. */
export function missingChoices(plan: Plan): Missing[] {
  const m: Missing[] = [], d = ownDob(plan, years0(plan))
  if (!d) m.push('dob')
  if (plan.retireAge == null) m.push('retireAge')
  if (plan.planUntil == null || (d && plan.planUntil <= ageInYear(d, years0(plan)))) m.push('planUntil')
  if (plan.infl == null) m.push('infl')
  if (partnerOn(plan) && num(plan.fin, 'pIncome') > 0 && plan.partnerRetireAge == null) m.push('partnerRetireAge')
  return m
}
