// Foundation level 3: costly debt and protection. The weakest check shows.
import type { HouseholdFigures } from '../../domain/planning/householdFigures.ts'
import { monthlyRateFromApr } from '../../domain/planning/loans.ts'
import { euro, hasValue, toNumber } from '../../lib/format.ts'
import type { Check, FoundationInputs } from './foundations.ts'

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
  if (plan.fin[list] !== 'Yes') return 0
  const income = toNumber(plan.fin.income)
  return (plan.lists[list] ?? []).reduce((total, { f }) => {
    if (hasValue(f.amount)) return total + Number(f.amount)
    if (list === 'workCover' && hasValue(f.mult) && income > 0)
      return total + Number(f.mult) * income
    return total
  }, 0)
}

function whyWorkedOut(plan: FoundationInputs, key: string) {
  if (toNumber(plan.fin[key]) > 0) return "the repayment given doesn't cover the interest"
  if (plan.src[key] && hasValue(plan.fin[key])) return "a €0 repayment wouldn't clear it"
  return 'no repayment was given'
}

const RANK = { bad: 0, mid: 1, na: 2, ok: 3, held: 3 }

export function debtAndProtection(plan: FoundationInputs, figures: HouseholdFigures) {
  const { fin, about } = plan
  const has = (key: string) => !!plan.src[key] && hasValue(fin[key])
  const checks: Check[] = []
  const workedOut = (key: string) =>
    ` (repayment worked out from your figures, because ${whyWorkedOut(plan, key)})`

  if (has('cardBal') || has('loanBal') || has('debt')) {
    const { cardBalance: card, loanBalance: loans } = figures
    if (card > 1) {
      const months = monthsToClear(card, figures.cardRate, figures.monthlyCardPayment)
      const text =
        months <= 12
          ? `Credit card ${euro(card)} clears in about ${Math.max(1, months)} months`
          : `Credit card ${euro(card)}${months === Infinity ? ' with no repayment set' : ` takes about ${months} months to clear`}`
      const extra = figures.cardPaymentEstimated ? workedOut('cardPayM') : ''
      checks.push({ status: months <= 12 ? 'mid' : 'bad', text: text + extra, tool: 'debtpay' })
    }
    if (loans > 1) {
      const months = monthsToClear(loans, figures.loanRate, figures.monthlyLoanPayment)
      const text =
        months <= 24
          ? `Loans of ${euro(loans)} clear in about ${Math.max(1, months)} months`
          : `Loans of ${euro(loans)}${months === Infinity ? ' with no repayment set' : ` take about ${Math.ceil(months / 12)} years to clear`}`
      const extra = figures.loanPaymentEstimated ? workedOut('loanPayM') : ''
      checks.push({ status: months <= 24 ? 'mid' : 'bad', text: text + extra, tool: 'debtpay' })
    }
    if (figures.debt <= 1) checks.push({ status: 'ok', text: 'No costly debt' })
  }

  const dependants = (about.deps ?? 0) > 0
  if (about.partner || dependants) {
    const life = coverTotal(plan, 'life')
    const work = coverTotal(plan, 'workCover')
    const throughWork = work > 0 ? `, plus ${euro(work)} through work` : ''
    if (!has('life'))
      checks.push({ status: 'na', text: 'Add your protection to check life cover', section: 4 })
    else if (fin.life === 'Yes')
      checks.push({
        status: 'ok',
        text: `Life cover in place${life > 0 ? ` (${euro(life)} covered)` : ''}${throughWork}`,
      })
    else if (work > 0)
      checks.push({ status: 'ok', text: `Cover through work in place (${euro(work)})` })
    else
      checks.push({
        status: fin.life === 'No' ? 'bad' : 'mid',
        text: `${fin.life === 'No' ? 'No life cover, and ' : 'Not sure about life cover, and '}${dependants ? 'people rely on you' : 'you plan with a partner'}`,
        tool: 'lifecover',
      })
  }

  if (fin.work && fin.work !== 'Not working') {
    const monthly = coverTotal(plan, 'ip')
    if (!has('ip'))
      checks.push({
        status: 'na',
        text: 'Add your protection to check income protection',
        section: 4,
      })
    else if (fin.ip === 'Yes')
      checks.push({
        status: 'ok',
        text: `Income protection in place${monthly > 0 ? ` (${euro(monthly)} a month)` : ''}`,
      })
    else
      checks.push({
        status: 'mid',
        text: "No income protection if you couldn't work",
        tool: 'incomegap',
      })
  }

  if (!checks.length)
    return {
      status: 'na' as const,
      text: 'Add your loans and protection to check this',
      section: 3,
    }
  const sorted = checks.toSorted((a, b) => RANK[a.status] - RANK[b.status])
  return { ...sorted[0], checks: sorted }
}
