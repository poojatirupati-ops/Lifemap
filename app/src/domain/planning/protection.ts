// Foundation level 3: costly debt and protection. The weakest check shows.
import { euro, hasValue, toNumber } from '../../lib/format.ts'
import {
  hasFigure,
  type Check,
  type FoundationInputs,
  type FoundationStatus,
} from './foundationCheck.ts'
import type { HouseholdFigures } from './householdFigures.ts'
import { monthlyRateFromApr } from './loans.ts'

/** Whole months to clear a balance at this repayment; Infinity when it never clears. */
export function monthsToClear(balance: number, apr: number, monthly: number) {
  const rate = monthlyRateFromApr(apr)
  if (monthly <= balance * rate || monthly <= 0) return Infinity
  const months = rate
    ? -Math.log(1 - (balance * rate) / monthly) / Math.log(1 + rate)
    : balance / monthly
  return Math.ceil(Math.round(months * 1e6) / 1e6)
}

/** The total cover on the customer's policies of one kind (work cover can be a multiple of pay). */
function coverTotal(plan: FoundationInputs, list: 'life' | 'workCover' | 'ip') {
  if (plan.figures[list] !== 'Yes') return 0
  const income = toNumber(plan.figures.income)
  return (plan.lists[list] ?? []).reduce((total, { fields: f }) => {
    if (hasValue(f.amount)) return total + Number(f.amount)
    if (list === 'workCover' && hasValue(f.mult) && income > 0)
      return total + Number(f.mult) * income
    return total
  }, 0)
}

function estimatedNote(plan: FoundationInputs, key: string) {
  const reason =
    toNumber(plan.figures[key]) > 0
      ? "the repayment given doesn't cover the interest"
      : hasFigure(plan, key)
        ? "a €0 repayment wouldn't clear it"
        : 'no repayment was given'
  return ` (repayment worked out from your figures, because ${reason})`
}

type Debt = {
  label: string
  balance: number
  rate: number
  payment: number
  /** the repayment field, when the repayment was worked out rather than given */
  estimatedKey: string | null
  soonMonths: number
  clears: string
  longText: (months: number) => string
}

function debtCheck(plan: FoundationInputs, debt: Debt): Check {
  const months = monthsToClear(debt.balance, debt.rate, debt.payment)
  const soon = months <= debt.soonMonths
  const clearing = soon
    ? ` ${debt.clears} in about ${Math.max(1, months)} months`
    : months === Infinity
      ? ' with no repayment set'
      : debt.longText(months)
  const note = debt.estimatedKey ? estimatedNote(plan, debt.estimatedKey) : ''
  return { status: soon ? 'mid' : 'bad', text: `${debt.label}${clearing}${note}`, tool: 'debtpay' }
}

function debtChecks(plan: FoundationInputs, figures: HouseholdFigures): Check[] {
  if (!['cardBal', 'loanBal', 'debt'].some((key) => hasFigure(plan, key))) return []
  const checks: Check[] = []
  const { cardBalance, loanBalance } = figures
  if (cardBalance > 1)
    checks.push(
      debtCheck(plan, {
        label: `Credit card ${euro(cardBalance)}`,
        balance: cardBalance,
        rate: figures.cardRate,
        payment: figures.monthlyCardPayment,
        estimatedKey: figures.cardPaymentEstimated ? 'cardPayM' : null,
        soonMonths: 12,
        clears: 'clears',
        longText: (months) => ` takes about ${months} months to clear`,
      }),
    )
  if (loanBalance > 1)
    checks.push(
      debtCheck(plan, {
        label: `Loans of ${euro(loanBalance)}`,
        balance: loanBalance,
        rate: figures.loanRate,
        payment: figures.monthlyLoanPayment,
        estimatedKey: figures.loanPaymentEstimated ? 'loanPayM' : null,
        soonMonths: 24,
        clears: 'clear',
        longText: (months) => ` take about ${Math.ceil(months / 12)} years to clear`,
      }),
    )
  if (figures.debt <= 1) checks.push({ status: 'ok', text: 'No costly debt' })
  return checks
}

function lifeCoverCheck(plan: FoundationInputs): Check | null {
  const { figures: fin, about } = plan
  const dependants = (about.dependants ?? 0) > 0
  if (!about.partner && !dependants) return null
  if (!hasFigure(plan, 'life'))
    return { status: 'na', text: 'Add your protection to check life cover', section: 4 }

  const work = coverTotal(plan, 'workCover')
  if (fin.life === 'Yes') {
    const life = coverTotal(plan, 'life')
    const covered = life > 0 ? ` (${euro(life)} covered)` : ''
    const throughWork = work > 0 ? `, plus ${euro(work)} through work` : ''
    return { status: 'ok', text: `Life cover in place${covered}${throughWork}` }
  }
  if (work > 0) return { status: 'ok', text: `Cover through work in place (${euro(work)})` }

  const cover = fin.life === 'No' ? 'No life cover' : 'Not sure about life cover'
  const why = dependants ? 'people rely on you' : 'you plan with a partner'
  return {
    status: fin.life === 'No' ? 'bad' : 'mid',
    text: `${cover}, and ${why}`,
    tool: 'lifecover',
  }
}

function incomeProtectionCheck(plan: FoundationInputs): Check | null {
  const { figures: fin } = plan
  if (!fin.work || fin.work === 'Not working') return null
  if (!hasFigure(plan, 'ip'))
    return { status: 'na', text: 'Add your protection to check income protection', section: 4 }
  if (fin.ip !== 'Yes')
    return { status: 'mid', text: "No income protection if you couldn't work", tool: 'incomegap' }
  const monthly = coverTotal(plan, 'ip')
  const amount = monthly > 0 ? ` (${euro(monthly)} a month)` : ''
  return { status: 'ok', text: `Income protection in place${amount}` }
}

const RANK: Record<FoundationStatus, number> = { bad: 0, mid: 1, na: 2, ok: 3, held: 3 }

export function debtAndProtection(
  plan: FoundationInputs,
  figures: HouseholdFigures,
): Check & { checks?: Check[] } {
  const checks = [
    ...debtChecks(plan, figures),
    lifeCoverCheck(plan),
    incomeProtectionCheck(plan),
  ].filter((check) => check != null)
  if (!checks.length)
    return {
      status: 'na',
      text: 'Add your loans and protection to check this',
      section: 3,
    }
  const weakestFirst = checks.toSorted((a, b) => RANK[a.status] - RANK[b.status])
  return { ...weakestFirst[0], checks: weakestFirst }
}
