// How complete the customer's picture is, and the figures most worth adding next (report page 3).
import { euro } from '../../lib/format.ts'
import {
  checkItems,
  needsAttention,
  withRepaymentLooks,
} from '../../components/finance/checkList.ts'
import type { ReportContext } from './context.ts'

// what to add next: [priority, label, why]; one line per label, most useful first
const NEXT_TO_ADD: Record<string, [number, string, string, string]> = {
  income: [0, 'High', 'Your income', 'Everything in the plan starts here'],
  costsM: [0, 'High', 'Monthly living costs', 'Shows how much you can save'],
  pension: [1, 'High', 'Pension value', 'The biggest tool for retiring early'],
  cash: [2, 'High', 'Cash savings', 'A head start for your pot'],
  sp: [3, 'High', 'State Pension record', ''],
  mortBal: [3.5, 'High', 'Mortgage', 'Your biggest monthly cost'],
  cardBal: [4, 'Medium', 'Loans and cards', 'Debt can cancel out saving'],
  loanBal: [4, 'Medium', 'Loans and cards', 'Debt can cancel out saving'],
  invest: [5, 'Medium', 'Investments', 'Part of your net worth'],
  pensionM: [6, 'Medium', 'Monthly pension payments', 'What you add each month'],
  life: [7, 'Medium', 'Protection', 'Cover that protects your plan'],
  ip: [7, 'Medium', 'Protection', 'Cover that protects your plan'],
}

export function completeness(context: ReportContext) {
  const { plan } = context
  const items = checkItems({ ...plan, look: withRepaymentLooks(plan) })
  const toAdd = items.filter(needsAttention).flatMap(({ key }) => {
    const known = NEXT_TO_ADD[key]
    if (!known) return []
    const [rank, priority, title, why] = known
    const sub =
      key === 'sp'
        ? `Up to ${euro(context.statePensionYear)} a year from ${context.statePensionAge}`
        : why
    return [{ rank, title, sub, priority }]
  })
  const items4 = toAdd
    .filter((item, index) => toAdd.findIndex((other) => other.title === item.title) === index)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 4)
    .map(({ title, sub, priority }) => ({ title, sub, priority }))
  return {
    have: items.length - items.filter(needsAttention).length,
    total: items.length,
    items: items4,
  }
}
