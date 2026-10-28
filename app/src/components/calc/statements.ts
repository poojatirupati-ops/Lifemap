// Confirming a statement read in Explore: its figures go into Your finances (never asked twice)
// and fill in the tools they belong to ("From your statement"). Mutates an immer draft.
import { readFigure, removeStatementFigures } from '../../domain/finances/figures.ts'
import { retirementGoal } from '../../domain/goals/goals.ts'
import type { Rules } from '../../domain/planning/rates.ts'
import { allInputs, calculatorFor } from './calculators.ts'
import { assumptionValue, type CalcPlan } from './context.ts'
import { OLD_STATEMENT, STATEMENT_KINDS, type StatementKind } from './statements.data.ts'

export interface StatementUpload {
  cat: string
  stage: 'scan' | 'confirm'
  files: string[]
  /** What the customer typed over the figures read, by key. */
  edit: Record<string, string>
}

type Read = Record<string, number | null>
/** A tool's figures from the statement; `untagged` are filled but not tagged "From your statement". */
type ToolFill = { figures: Read; untagged?: string[] }

export const defaultFiles = (cat: string) => {
  const { title, date } = STATEMENT_KINDS[cat]
  return [`${title} · ${date}.pdf`]
}

export const allFigures = (kind: StatementKind) => [...kind.figures, ...(kind.extra?.figures ?? [])]

/** "Expect full", "Partly" or "Not sure" from PRSI years. */
export const statePensionFromYears = ({ sp }: Rules, years: number) =>
  years >= sp.fullYears ? 'Expect full' : years >= sp.minYears ? 'Partly' : 'Not sure'

/** The figures as confirmed, and how sure the reader was (null once the customer corrected one). */
function confirmed(kind: StatementKind, edit: StatementUpload['edit']) {
  const values: Read = {}
  const sure: Read = {}
  for (const [key, , read, confidence, , optional] of allFigures(kind)) {
    const typed = edit[key]
    if (typed != null && typed.trim() === '') {
      // a cleared optional figure was not on the statement
      values[key] = optional ? null : read
      sure[key] = optional ? null : confidence
      continue
    }
    const corrected = typed != null && !isNaN(+typed)
    values[key] = corrected ? +typed : read
    sure[key] = typed != null && +typed !== read ? null : confidence
  }
  return { values, sure }
}

/** Puts each statement figure into Your finances. */
function feedFinances(plan: CalcPlan, cat: string, v: Read, sure: Read, rules: Rules) {
  const put = (key: string, value: number | string, confidence: number | null) => {
    delete plan.look[key]
    readFigure(plan, key, value, confidence ?? undefined, confidence == null, 'pst:' + cat)
  }
  if (cat === 'retire') {
    put('pension', v.pot!, sure.pot)
    const bothSure = sure.youM == null || sure.empM == null ? null : Math.min(sure.youM, sure.empM)
    put('pensionM', v.youM! + v.empM!, bothSure)
    put('pensionOwnM', v.youM!, sure.youM)
    put('spYears', v.prsi!, sure.prsi)
    put('sp', statePensionFromYears(rules, v.prsi!), sure.prsi)
    if (v.chg != null) put('penChg', v.chg, sure.chg)
    else removeStatementFigures(plan, ['penChg'])
  } else if (cat === 'home') {
    put('home', 'Own with mortgage', 99)
    put('mortBal', v.bal!, sure.bal)
    put('mortRate', v.rate!, sure.rate)
    put('mortPayM', v.pay!, sure.pay)
    put('mortYears', v.yrs!, sure.yrs)
    if (v.hval != null) put('homeValue', v.hval, sure.hval)
  } else put('invest', v.tot!, sure.tot)
}

/** What the statement fills in, tool by tool. */
export function toolFills(
  plan: CalcPlan,
  cat: string,
  v: Read,
  rules: Rules,
): Record<string, ToolFill> {
  if (cat === 'home') {
    const mortgage = { loan: v.bal, rate: v.rate }
    return {
      repayment: { figures: { ...mortgage, term: v.yrs } },
      overpay: { figures: { bal: v.bal, rate: v.rate, yrs: v.yrs } },
      ratechange: { figures: { ...mortgage, term: v.yrs } },
      term: { figures: { ...mortgage, a: v.yrs } },
    }
  }
  if (cat === 'invest') {
    const style = v.sh == null ? null : v.sh >= 70 ? 3 : v.sh >= 40 ? 2 : 1
    // no charges on the statement = no default charge
    const fees = (key: string): ToolFill['figures'] => ({ [key]: v.chg ?? 0 })
    const untagged = (key: string) => (v.chg == null ? [key] : [])
    return {
      regularinvest: { figures: { m: v.mon, ...fees('f') }, untagged: untagged('f') },
      lumpsum: { figures: { p: v.tot, ...fees('f') }, untagged: untagged('f') },
      realreturn: { figures: { p: v.tot } },
      fees: { figures: { p: v.tot, ...fees('a') }, untagged: untagged('a') },
      riskreturn: { figures: { p: v.tot, ...(style && { s: style }) } },
    }
  }
  const age = plan.about.age ?? 0
  const retireAt = plan.app && retirementGoal(plan.goals) ? plan.retireAge : v.nra!
  const yearsLeft = age >= 18 ? Math.max(1, retireAt - age) : null
  // growth after the statement's own charges, the same rule as the plan
  const growth: Read =
    v.chg == null
      ? {}
      : {
          g: +(
            (Number(assumptionValue(plan, 'pen')) +
              Number(assumptionValue(plan, 'penChg')) -
              v.chg / 100) *
            100
          ).toFixed(2),
        }
  const shares: Record<string, number> = { 'Expect full': 1, Partly: 0.6 }
  const share = shares[statePensionFromYears(rules, v.prsi!)] ?? 0.8
  const statePension = Math.round((rules.sp.week * rules.sp.weeks * share) / 500) * 500
  const drawdown = { figures: { pot: v.proj ?? v.pot } }
  return {
    retirement: {
      figures: { pot: v.pot, m: v.youM! + v.empM!, ra: retireAt, o: statePension, ...growth },
    },
    contrib: { figures: { y: yearsLeft, ...growth } },
    avc: { figures: { y: yearsLeft, ...growth } },
    lastmoney: drawdown,
    drawdown,
  }
}

/** "Looks right, fill in my tools". Returns where the figures went in Your finances. */
export function confirmStatement(plan: CalcPlan, upload: StatementUpload, rules: Rules) {
  const kind = STATEMENT_KINDS[upload.cat]
  const { values, sure } = confirmed(kind, upload.edit)
  feedFinances(plan, upload.cat, values, sure, rules)
  if (kind.old && upload.cat === 'retire') plan.look.pension = OLD_STATEMENT
  plan.pdocs[upload.cat] = {
    name: kind.title,
    date: kind.date,
    v: {
      ...values,
      ...(kind.projectionInTodaysMoney && { projToday: kind.projectionInTodaysMoney }),
    },
  }
  // a new statement resets each tool to the statement
  for (const [toolId, fill] of Object.entries(toolFills(plan, upload.cat, values, rules))) {
    const keys = allInputs(calculatorFor(toolId)).map(({ key }) => key)
    const kept = Object.entries(fill.figures).filter(([key, x]) => x != null && keys.includes(key))
    plan.calcDoc[toolId] = Object.fromEntries(kept)
    plan.calcSrc[toolId] = kept.map(([key]) => key).filter((key) => !fill.untagged?.includes(key))
    plan.calcT[toolId] = {}
  }
  return kind.where
}

/** "Remove statement": the customer's own figures are used again. */
export function removeStatement(plan: CalcPlan, cat: string, rules: Rules) {
  const document = plan.pdocs[cat] as { v: Read } | undefined
  if (!document) return
  const tools = Object.keys(toolFills(plan, cat, document.v, rules))
  removeStatementFigures(
    plan,
    Object.keys(plan.docOf).filter((key) => plan.docOf[key] === 'pst:' + cat),
  )
  delete plan.pdocs[cat]
  for (const toolId of tools) {
    delete plan.calcDoc[toolId]
    delete plan.calcSrc[toolId]
    delete plan.calcT[toolId]
  }
}
