// Every judgement value the projection uses. Pure.
import { RI } from './rates.ts'
import { MARKET, STANDARDS, T_SET, resolve, type Custom } from './settings.ts'
import type { Plan } from '../state/types.ts'

// the customer's own, else the register's standard (Cautious set: its lower growth), else a labelled planning figure.
export function assume(plan: Plan) {
  const asm = plan.asm as Custom, cautious = plan.assume === 'cautious'
  const raw = (k: string) => { const x = asm[k]; return typeof x === 'number' && Number.isFinite(x) ? x : undefined }
  const v = (k: string): number => {
    const r = resolve(k, asm), std = STANDARDS[k as keyof typeof STANDARDS]
    return (cautious && r.label === T_SET && 'vc' in std ? (std as { vc: number }).vc : r.value) as number
  }
  const mk = (k: 'mortRate' | 'loanRate' | 'cardRate', fb: number) => (resolve(k, asm).value as number | undefined) ?? (MARKET[k].v as number | null) ?? fb
  const spW = (own: boolean) => RI.sp.week * (own ? 0.6 : 0.8)
  return {
    infl: plan.infl as number, wage: v('wage'), cash: v('cash'), inv: v('inv'), pen: v('pen'), penRet: v('penRet'),
    sp: RI.sp.week * RI.sp.weeks, spAge: RI.sp.age,
    mortRate: mk('mortRate', 0.0375), cardRate: mk('cardRate', 0.2), loanRate: mk('loanRate', 0.08),
    buffer: plan.emergencyMonths ?? v('safetyMonths'), longYrs: v('cashYears'), share: v('saveShare'), noAnswer: v('noAnswer'),
    investShare: v('investShare'), cgtGain: v('cgtGain'), accessAge: v('accessAge'), lumpSum: v('lumpSum'),
    rule: v('drawRule') as unknown as string, drawFixed: raw('drawFixed') ?? 20000,
    spGrow: v('spGrow') as unknown as string, flatBands: (v('bands') as unknown as string) === 'flat',
    retireSpend: v('retireSpend'), ownShare: v('ownShare'), penChg: raw('penChg') ?? (MARKET.fundChg.v as number), spYears: raw('spYears'),
    spWeek: raw('spWeek') ?? spW(plan.fin.sp === 'Partly'), pSpWeek: raw('pSpWeek') ?? spW(plan.fin.pSp === 'Own partial'),
  }
}
export type A = ReturnType<typeof assume>
