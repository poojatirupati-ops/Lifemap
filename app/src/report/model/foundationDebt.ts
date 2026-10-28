// Foundation level 3: costly debt and protection; the weakest item speaks for the level.
import { euro, hasValue, toNumber } from '../../lib/format.ts'
import { monthlyRateFromApr } from '../../domain/planning/loans.ts'
import { hasFigure, type ReportContext } from './context.ts'
import type { Check } from './foundations.ts'

const WORST_FIRST: Record<string, number> = { bad: 0, mid: 1, na: 2, ok: 3 }

/** Months to clear a balance at a monthly rate, rounded up; never when the payment misses the interest. */
function monthsToClear(balance: number, rate: number, pay: number) {
  if (pay <= balance * rate || pay <= 0) return Infinity
  const months = rate ? -Math.log(1 - (balance * rate) / pay) / Math.log(1 + rate) : balance / pay
  return Math.ceil(Math.round(months * 1e6) / 1e6)
}

export function debtAndProtection(context: ReportContext): Check {
  const { plan, figures: f } = context
  const { fin } = plan
  const has = (key: string) => hasFigure(plan, key)
  const coverTotal = (list: string) =>
    fin[list] !== 'Yes'
      ? 0
      : (plan.lists[list] ?? []).reduce((sum, { f: item }) => {
          if (hasValue(item.amount)) return sum + Number(item.amount)
          const income = toNumber(fin.income)
          return list === 'workCover' && hasValue(item.mult) && income > 0
            ? sum + Number(item.mult) * income
            : sum
        }, 0)
  const repaymentWhy = (key: string) =>
    toNumber(fin[key]) > 0
      ? 'the repayment given doesn’t cover the interest'
      : has(key)
        ? 'a €0 repayment wouldn’t clear it'
        : 'no repayment was given'

  const items: Check[] = []
  const debt = (balance: number, rate: number, pay: number, estimated: boolean, card: boolean) => {
    const months = monthsToClear(balance, monthlyRateFromApr(rate), pay)
    const what = card ? `Credit card ${euro(balance)}` : `Loans of ${euro(balance)}`
    const soon = months <= (card ? 12 : 24)
    const text = soon
      ? `${what} ${card ? 'clears' : 'clear'} in about ${Math.max(1, Math.ceil(months))} months`
      : months === Infinity
        ? `${what} with no repayment set`
        : card
          ? `${what} takes about ${Math.ceil(months)} months to clear`
          : `${what} take about ${Math.ceil(months / 12)} years to clear`
    const why = estimated
      ? ` (repayment worked out from your figures, because ${repaymentWhy(card ? 'cardPayM' : 'loanPayM')})`
      : ''
    items.push({ state: soon ? 'mid' : 'bad', text: text + why, action: 'debtpay' })
  }
  if (has('cardBal') || has('loanBal') || has('debt')) {
    if (f.cardBalance > 1)
      debt(f.cardBalance, f.cardRate, f.monthlyCardPayment, f.cardPaymentEstimated, true)
    if (f.loanBalance > 1)
      debt(f.loanBalance, f.loanRate, f.monthlyLoanPayment, f.loanPaymentEstimated, false)
    if (f.debt <= 1) items.push({ state: 'ok', text: 'No costly debt' })
  }
  const dependants = (plan.about.deps ?? 0) > 0
  if (plan.about.partner || dependants) {
    const life = coverTotal('life')
    const atWork = coverTotal('workCover')
    if (!has('life')) items.push({ state: 'na', text: 'Add your protection to check life cover' })
    else if (fin.life === 'Yes')
      items.push({
        state: 'ok',
        text: `Life cover in place${life > 0 ? ` (${euro(life)} covered)` : ''}${atWork > 0 ? `, plus ${euro(atWork)} through work` : ''}`,
      })
    else if (atWork > 0)
      items.push({ state: 'ok', text: `Cover through work in place (${euro(atWork)})` })
    else
      items.push({
        state: fin.life === 'No' ? 'bad' : 'mid',
        text: `${fin.life === 'No' ? 'No life cover, and ' : 'Not sure about life cover, and '}${dependants ? 'people rely on you' : 'you plan with a partner'}`,
        action: 'lifecover',
      })
  }
  if (fin.work && fin.work !== 'Not working') {
    const cover = coverTotal('ip')
    if (!has('ip'))
      items.push({ state: 'na', text: 'Add your protection to check income protection' })
    else if (fin.ip === 'Yes')
      items.push({
        state: 'ok',
        text: `Income protection in place${cover > 0 ? ` (${euro(cover)} a month)` : ''}`,
      })
    else
      items.push({
        state: 'mid',
        text: 'No income protection if you couldn’t work',
        action: 'incomegap',
      })
  }
  if (!items.length) return { state: 'na', text: 'Add your loans and protection to check this' }
  return items.sort((a, b) => WORST_FIRST[a.state] - WORST_FIRST[b.state])[0]
}
