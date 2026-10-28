// What Your assumptions' controls do.
import { rules2026 } from '../../domain/planning/rates.ts'
import { ASSUMPTIONS } from './assumptionFields.data.ts'
import { updateMe, type MePlan } from './mePlan.ts'

const addVersion = (plan: MePlan, note: string) => plan.versions.push({ note, date: '29 Sep 2026' })

const forget = (plan: MePlan, key: string) => {
  if (plan.advRate) delete plan.advRate[key]
}

/** A chip choice, or a typed figure (percentages are typed as 2.5 and kept as 0.025). */
export function setAssumption(key: string, value: number | string) {
  const { kind, step = 1 } = ASSUMPTIONS[key] ?? {}
  updateMe((plan) => {
    forget(plan, key)
    if (typeof value === 'string') plan.asm[key] = value
    else if (kind === 'pct') plan.asm[key] = +(value / 100).toFixed(6)
    else plan.asm[key] = step % 1 === 0 ? Math.round(value) : value
  })
}

/** Back to LifeMap's figure, or to the assumed rate. */
export const resetAssumption = (key: string) =>
  updateMe((plan) => {
    delete plan.asm[key]
    forget(plan, key)
  })

export const capCardRate = () =>
  updateMe((plan) => {
    plan.asm.cardRate = rules2026.guide.cardCap
    forget(plan, 'cardRate')
    addVersion(plan, 'Credit-card rate: the legal limit for new cards')
  })

/** "I don't know my rate": a planning rate, flagged for the adviser to check. */
export const leaveRateForAdviser = (key: 'cardRate' | 'loanRate') =>
  updateMe((plan) => {
    plan.asm[key] = ASSUMPTIONS[key].fallback!
    plan.advRate = { ...plan.advRate, [key]: true }
    addVersion(plan, 'Rate left for my adviser (planning rate used)')
  })

/** Keeps the open group open across changes (the original's S.asmOpen). */
export const rememberOpenGroup = (group: string, open: boolean) =>
  updateMe((plan) => {
    if (open) plan.asmOpen = group
    else if (plan.asmOpen === group) plan.asmOpen = null
  })
