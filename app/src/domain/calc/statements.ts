// Confirming a statement read in Explore: its figures go into Your finances (never asked twice)
// and fill in the tools they belong to ("From your statement"). Mutates an immer draft.
import { readFigure, removeStatementFigures } from '../finances/figures.ts'
import type { Rules } from '../planning/rates.ts'
import { allInputs, calculatorFor } from './calculators.ts'
import type { Plan, Ui } from '../../state/types.ts'
import { retirementGoal } from '../goals/goals.ts'
import { assumptionValue } from './context.ts'
import {
  OLD_STATEMENT,
  STATEMENT_KINDS,
  type StatementFigure,
  type StatementKind,
} from './statements.data.ts'
import type { DocumentRead } from '../finances/upload.ts'

type Read = Record<string, number | null>
/** A figure every statement of its kind has (only optional ones can be cleared). */
const figureOf = (read: Read, key: string) => read[key] ?? 0

/** A tool's figures from the statement; `untagged` are filled but not tagged "From your statement". */
type ToolFill = { figures: Read; untagged?: string[] }

/** "Expect full", "Partly" or "Not sure" from PRSI years. */
export const statePensionFromYears = ({ sp }: Rules, years: number) =>
  years >= sp.fullYears ? 'Expect full' : years >= sp.minYears ? 'Partly' : 'Not sure'

/** What the statement fills in, tool by tool. */
function toolFills(
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

type CalcFigures = Pick<Ui, 'calcStatementFigures' | 'calcStatementKeys' | 'calcTouched'>

export interface StatementUpload {
  cat: string
  stage: 'scan' | 'confirm'
  files: string[]
  /** What the customer typed over the figures read, by key. */
  edit: Record<string, string>
  /** What the document reader found; absent for the sample statement. */
  read?: DocumentRead
}

/**
 * The statement as read: the reader's figures (only those it found) over the sample's labels and units. A real reader's
 * statement has no sample texts or date; the example reader keeps them.
 */
export function statementKind({ cat, read }: Pick<StatementUpload, 'cat' | 'read'>): StatementKind {
  const kind = STATEMENT_KINDS[cat]
  if (!read) return kind
  const found = (figures: StatementFigure[]) =>
    figures.flatMap((figure) => {
      const field = read.fields[figure.key]
      return typeof field?.value === 'number'
        ? [{ ...figure, read: field.value, confidence: field.confidence }]
        : []
    })
  const sample = read.provider === 'example'
  return {
    ...kind,
    figures: found(kind.figures),
    extra: kind.extra && { ...kind.extra, figures: found(kind.extra.figures) },
    texts: sample ? kind.texts : undefined,
    date: sample ? kind.date : '',
    old: sample && kind.old,
    projectionInTodaysMoney: sample ? kind.projectionInTodaysMoney : undefined,
  }
}

export const defaultFiles = (cat: string) => {
  const { title, date } = STATEMENT_KINDS[cat]
  return [`${title} · ${date}.pdf`]
}

const allFigures = (kind: StatementKind) => [...kind.figures, ...(kind.extra?.figures ?? [])]

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
export function confirmStatement(
  plan: Plan,
  ui: CalcFigures,
  upload: StatementUpload,
  rules: Rules,
) {
  const kind = statementKind(upload)
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
    ui.calcStatementFigures[toolId] = Object.fromEntries(kept)
    ui.calcStatementKeys[toolId] = kept
      .map(([key]) => key)
      .filter((key) => !fill.untagged?.includes(key))
    ui.calcTouched[toolId] = {}
  }
}

/** "Remove statement": the customer's own figures are used again. */
export function removeStatement(plan: Plan, ui: CalcFigures, cat: string, rules: Rules) {
  const document = plan.statements[cat] as { figures: Read } | undefined
  if (!document) return
  const tools = Object.keys(toolFills(plan, cat, document.figures, rules))
  removeStatementFigures(
    plan,
    Object.keys(plan.documentOf).filter((key) => plan.documentOf[key] === 'pst:' + cat),
  )
  delete plan.statements[cat]
  for (const toolId of tools) {
    delete ui.calcStatementFigures[toolId]
    delete ui.calcStatementKeys[toolId]
    delete ui.calcTouched[toolId]
  }
}
