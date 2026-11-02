// Check your details: which figures are fine, typed, missing or worth a second look.
import { FINANCE_SECTIONS, type FinanceSection } from '../../domain/finances/sections.data.ts'
import { assumption, chosenAssumption } from '../../domain/planning/assumptions.ts'
import { householdFigures } from '../../domain/planning/householdFigures.ts'
import { rulesFor } from '../../domain/planning/rates.ts'
import { euro, hasValue, percent, toNumber } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'
import { FINANCE_FIELDS } from '../../domain/finances/fields.data.ts'
import { fieldSource, requiredFields, visibleFields, type FinancePlan } from './status.ts'

export type CheckState = 'look' | 'miss' | 'ok' | 'typed'
export type CheckItem = { key: string; section: FinanceSection; state: CheckState }

export type CheckPlan = FinancePlan & Pick<Plan, 'retireAge'>

const PAY_LOW =
  'This repayment barely covers the interest, so the balance would take many years to clear. Check it, or pay a bit more'
const MORTGAGE_LOW = "This repayment wouldn't clear the mortgage in the years left"

const figuresOf = (plan: CheckPlan) =>
  householdFigures(plan, rulesFor(assumption(plan, 'startYear')))

// a card or loan repayment under the interest plus 1% of the balance a month, when the rate is known
function paysTooLittle(plan: CheckPlan, balance: string, pay: string, rate: string) {
  const typedRate = toNumber(plan.figures[rate])
  const apr = typedRate > 0 ? typedRate / 100 : +(chosenAssumption(plan.assumptions, rate) ?? 0)
  const owed = toNumber(plan.figures[balance])
  const paid = toNumber(plan.figures[pay])
  return owed > 0 && paid > 0 && apr > 0 && paid < owed * (apr / 12 + 0.01)
}

/**
 * The "needs a look" notes after flagging repayments that are too low and clearing flags that no
 * longer apply. Notes the customer or a document left are kept.
 */
export function withRepaymentLooks(plan: CheckPlan): Record<string, string> {
  const look = { ...plan.warnings }
  const flags: [key: string, note: string, low: boolean][] = [
    ['cardPayM', PAY_LOW, paysTooLittle(plan, 'cardBal', 'cardPayM', 'cardRate')],
    ['loanPayM', PAY_LOW, paysTooLittle(plan, 'loanBal', 'loanPayM', 'loanRate')],
    ['mortPayM', MORTGAGE_LOW, figuresOf(plan).mortgagePaymentLow],
  ]
  for (const [key, note, low] of flags) {
    if (low && !look[key]) look[key] = note
    else if (!low && look[key] === note) delete look[key]
  }
  return look
}

/** The plan with its repayment looks applied. */
export const withLooks = <P extends CheckPlan>(plan: P): P => ({
  ...plan,
  warnings: withRepaymentLooks(plan),
})

export function checkItems(plan: CheckPlan): CheckItem[] {
  return FINANCE_SECTIONS.flatMap((section) =>
    visibleFields(section, plan)
      .filter((key) => key !== 'retireAge')
      .flatMap((key): CheckItem[] => {
        const source = fieldSource(key, plan)
        if (plan.warnings[key]) return [{ key, section, state: 'look' }]
        if (!source) return FINANCE_FIELDS[key].optional ? [] : [{ key, section, state: 'miss' }]
        return [{ key, section, state: source === 'doc' ? 'ok' : 'typed' }]
      }),
  )
}

export const needsAttention = (item: CheckItem) => item.state === 'look' || item.state === 'miss'

/** Every figure the section needs was left for the adviser. */
export const isSectionLeftForAdviser = (section: FinanceSection, plan: CheckPlan) =>
  requiredFields(section, plan).every((key) => plan.acknowledged[key])

const ASSUMED = 'Assumed: add yours · we use'

/** What a missing figure counts as. */
function missingNote(key: string, plan: CheckPlan) {
  const notes: Record<string, string> = {
    mortRate: `${ASSUMED} the Central Bank average rate`,
    cardRate: `${ASSUMED} a planning rate of ${percent(assumption(plan, 'cardRate'))}`,
    loanRate: `${ASSUMED} the Central Bank average rate`,
    mort2: `${ASSUMED} 25 years`,
    mortYears: `${ASSUMED} 25 years`,
    pAge: `${ASSUMED} your age`,
    work: `${ASSUMED} Employed`,
  }
  return notes[key] ?? 'Missing · optional, counts as €0'
}

/** Needs a look: why; missing: what it counts as. */
export const itemNote = (item: CheckItem, plan: CheckPlan) =>
  item.state === 'look' ? `Needs a look: ${plan.warnings[item.key]}` : missingNote(item.key, plan)

const WORKED_OUT = 'Worked out from your figures:'
const REPLACE = 'Type yours to replace it.'

// why a card or loan repayment was worked out
function whyWorkedOut(key: string, plan: CheckPlan) {
  if (toNumber(plan.figures[key]) > 0) return "the repayment given doesn't cover the interest"
  if (plan.sources[key] && hasValue(plan.figures[key])) return "a €0 repayment wouldn't clear it"
  return 'no repayment was given'
}

/** A repayment the plan works out because the one given would not clear the debt. */
export function workedOutNote(key: string, plan: CheckPlan) {
  const figures = figuresOf(plan)
  if (
    key === 'mortPayM' &&
    figures.mortgageBalance > 0 &&
    figures.mortgageEstimated &&
    figures.mortgageTermKnown
  ) {
    const typedZero = plan.sources.mortPayM && toNumber(plan.figures.mortPayM) === 0
    return `${WORKED_OUT} about ${euro(figures.monthlyMortgage)} a month, from your balance, rate and years left${typedZero ? ", because a €0 repayment wouldn't clear it" : ''}. ${REPLACE}`
  }
  const debts: Record<string, { owed: number; estimated: boolean; monthly: number }> = {
    cardPayM: {
      owed: figures.cardBalance,
      estimated: figures.cardPaymentEstimated,
      monthly: figures.monthlyCardPayment,
    },
    loanPayM: {
      owed: figures.loanBalance,
      estimated: figures.loanPaymentEstimated,
      monthly: figures.monthlyLoanPayment,
    },
  }
  const debt = debts[key]
  if (!debt || debt.owed <= 0 || !debt.estimated) return ''
  return `${WORKED_OUT} ${euro(debt.monthly)} a month clears it in 5 years, because ${whyWorkedOut(key, plan)}. ${REPLACE}`
}
