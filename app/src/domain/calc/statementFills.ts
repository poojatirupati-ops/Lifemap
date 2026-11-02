// What a confirmed statement fills in, tool by tool.
import { retirementGoal } from '../goals/goals.ts'
import type { Rules } from '../planning/rates.ts'
import type { Plan } from '../../state/types.ts'
import { assumptionValue } from './context.ts'

export type Read = Record<string, number | null>
/** A figure every statement of its kind has (only optional ones can be cleared). */
export const figureOf = (read: Read, key: string) => read[key] ?? 0

/** A tool's figures from the statement; `untagged` are filled but not tagged "From your statement". */
export type ToolFill = { figures: Read; untagged?: string[] }

/** "Expect full", "Partly" or "Not sure" from PRSI years. */
export const statePensionFromYears = ({ sp }: Rules, years: number) =>
  years >= sp.fullYears ? 'Expect full' : years >= sp.minYears ? 'Partly' : 'Not sure'

/** What the statement fills in, tool by tool. */
export function toolFills(
  plan: Plan,
  cat: string,
  read: Read,
  rules: Rules,
): Record<string, ToolFill> {
  if (cat === 'home') {
    const mortgage = { loan: read.bal, rate: read.rate }
    return {
      repayment: { figures: { ...mortgage, term: read.yrs } },
      overpay: { figures: { bal: read.bal, rate: read.rate, yrs: read.yrs } },
      ratechange: { figures: { ...mortgage, term: read.yrs } },
      term: { figures: { ...mortgage, a: read.yrs } },
    }
  }
  if (cat === 'invest') {
    const style = read.sh == null ? null : read.sh >= 70 ? 3 : read.sh >= 40 ? 2 : 1
    // no charges on the statement = no default charge
    const fees = (key: string): ToolFill['figures'] => ({ [key]: read.chg ?? 0 })
    const untagged = (key: string) => (read.chg == null ? [key] : [])
    return {
      regularinvest: { figures: { m: read.mon, ...fees('f') }, untagged: untagged('f') },
      lumpsum: { figures: { p: read.tot, ...fees('f') }, untagged: untagged('f') },
      realreturn: { figures: { p: read.tot } },
      fees: { figures: { p: read.tot, ...fees('a') }, untagged: untagged('a') },
      riskreturn: { figures: { p: read.tot, ...(style && { s: style }) } },
    }
  }
  const age = plan.about.age ?? 0
  const retireAt =
    plan.hasResults && retirementGoal(plan.goals) ? plan.retireAge : figureOf(read, 'nra')
  const yearsLeft = age >= 18 ? Math.max(1, retireAt - age) : null
  // growth after the statement's own charges, the same rule as the plan
  const growth: Read =
    read.chg == null
      ? {}
      : {
          g: +(
            (Number(assumptionValue(plan, 'pen')) +
              Number(assumptionValue(plan, 'penChg')) -
              read.chg / 100) *
            100
          ).toFixed(2),
        }
  const shares: Record<string, number> = { 'Expect full': 1, Partly: 0.6 }
  const share = shares[statePensionFromYears(rules, figureOf(read, 'prsi'))] ?? 0.8
  const statePension = Math.round((rules.sp.week * rules.sp.weeks * share) / 500) * 500
  const drawdown = { figures: { pot: read.proj ?? read.pot } }
  return {
    retirement: {
      figures: {
        pot: read.pot,
        m: figureOf(read, 'youM') + figureOf(read, 'empM'),
        ra: retireAt,
        o: statePension,
        ...growth,
      },
    },
    contrib: { figures: { y: yearsLeft, ...growth } },
    avc: { figures: { y: yearsLeft, ...growth } },
    lastmoney: drawdown,
    drawdown,
  }
}
