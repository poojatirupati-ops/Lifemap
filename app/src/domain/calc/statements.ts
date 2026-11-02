// Confirming a statement read in Explore: its figures go into Your finances (never asked twice)
// and fill in the tools they belong to ("From your statement"). Mutates an immer draft.
import { readFigure, removeStatementFigures } from '../finances/figures.ts'
import type { Rules } from '../planning/rates.ts'
import { allInputs, calculatorFor } from './calculators.ts'
import type { Plan } from '../../state/types.ts'
import { figureOf, statePensionFromYears, toolFills, type Read } from './statementFills.ts'
import { OLD_STATEMENT, STATEMENT_KINDS, type StatementKind } from './statements.data.ts'

export interface StatementUpload {
  cat: string
  stage: 'scan' | 'confirm'
  files: string[]
  /** What the customer typed over the figures read, by key. */
  edit: Record<string, string>
}

export const defaultFiles = (cat: string) => {
  const { title, date } = STATEMENT_KINDS[cat]
  return [`${title} · ${date}.pdf`]
}

export const allFigures = (kind: StatementKind) => [...kind.figures, ...(kind.extra?.figures ?? [])]

/** The figures as confirmed, and how sure the reader was (null once the customer corrected one). */
function confirmed(kind: StatementKind, edit: StatementUpload['edit']) {
  const values: Read = {}
  const sure: Read = {}
  for (const { key, read, confidence, optional } of allFigures(kind)) {
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

/** The PRSI years shown while confirming: as typed, else as read (0 when not a number). */
export function prsiYears(kind: StatementKind, edit: StatementUpload['edit']) {
  const shown = edit.prsi ?? allFigures(kind).find(({ key }) => key === 'prsi')?.read
  return Number(shown) || 0
}

/** Puts each statement figure into Your finances. */
function feedFinances(plan: Plan, cat: string, read: Read, sure: Read, rules: Rules) {
  const put = (key: string, value: number | string, confidence: number | null) => {
    delete plan.warnings[key]
    readFigure(plan, key, {
      value,
      confidence: confidence ?? undefined,
      corrected: confidence == null,
      from: 'pst:' + cat,
    })
  }
  const figure = (key: string) => figureOf(read, key)
  if (cat === 'retire') {
    put('pension', figure('pot'), sure.pot)
    const bothSure = sure.youM == null || sure.empM == null ? null : Math.min(sure.youM, sure.empM)
    put('pensionM', figure('youM') + figure('empM'), bothSure)
    put('pensionOwnM', figure('youM'), sure.youM)
    put('spYears', figure('prsi'), sure.prsi)
    put('sp', statePensionFromYears(rules, figure('prsi')), sure.prsi)
    if (read.chg != null) put('penChg', read.chg, sure.chg)
    else removeStatementFigures(plan, ['penChg'])
  } else if (cat === 'home') {
    put('home', 'Own with mortgage', 99)
    put('mortBal', figure('bal'), sure.bal)
    put('mortRate', figure('rate'), sure.rate)
    put('mortPayM', figure('pay'), sure.pay)
    put('mortYears', figure('yrs'), sure.yrs)
    if (read.hval != null) put('homeValue', read.hval, sure.hval)
  } else put('invest', figure('tot'), sure.tot)
}

/** "Looks right, fill in my tools". */
export function confirmStatement(plan: Plan, upload: StatementUpload, rules: Rules) {
  const kind = STATEMENT_KINDS[upload.cat]
  const { values, sure } = confirmed(kind, upload.edit)
  feedFinances(plan, upload.cat, values, sure, rules)
  if (kind.old && upload.cat === 'retire') plan.warnings.pension = OLD_STATEMENT
  plan.statements[upload.cat] = {
    name: kind.title,
    date: kind.date,
    figures: {
      ...values,
      ...(kind.projectionInTodaysMoney && { projToday: kind.projectionInTodaysMoney }),
    },
  }
  // a new statement resets each tool to the statement
  for (const [toolId, fill] of Object.entries(toolFills(plan, upload.cat, values, rules))) {
    const keys = allInputs(calculatorFor(toolId)).map(({ key }) => key)
    const kept = Object.entries(fill.figures).filter(
      (entry): entry is [string, number] => entry[1] != null && keys.includes(entry[0]),
    )
    plan.calcStatementFigures[toolId] = Object.fromEntries(kept)
    plan.calcStatementKeys[toolId] = kept.map(([key]) => key).filter((key) => !fill.untagged?.includes(key))
    plan.calcTouched[toolId] = {}
  }
}

/** "Remove statement": the customer's own figures are used again. */
export function removeStatement(plan: Plan, cat: string, rules: Rules) {
  const document = plan.statements[cat] as { figures: Read } | undefined
  if (!document) return
  const tools = Object.keys(toolFills(plan, cat, document.figures, rules))
  removeStatementFigures(
    plan,
    Object.keys(plan.documentOf).filter((key) => plan.documentOf[key] === 'pst:' + cat),
  )
  delete plan.statements[cat]
  for (const toolId of tools) {
    delete plan.calcStatementFigures[toolId]
    delete plan.calcStatementKeys[toolId]
    delete plan.calcTouched[toolId]
  }
}
