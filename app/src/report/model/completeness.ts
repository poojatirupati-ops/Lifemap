// How complete the customer's picture is, and the figures most worth adding next (report page 3).
import { euro } from '../../lib/format.ts'
import {
  checkItems,
  needsAttention,
  withRepaymentLooks,
} from '../../components/finance/checkList.ts'
import type { ReportContext } from './context.ts'

interface NextToAdd {
  /** most useful first */
  rank: number
  priority: 'High' | 'Medium'
  title: string
  why: string
}

const LOANS: NextToAdd = {
  rank: 4,
  priority: 'Medium',
  title: 'Loans and cards',
  why: 'Debt can cancel out saving',
}
const PROTECTION: NextToAdd = {
  rank: 7,
  priority: 'Medium',
  title: 'Protection',
  why: 'Cover that protects your plan',
}

// what to add next, by the figure that is missing
const NEXT_TO_ADD: Record<string, NextToAdd> = {
  income: {
    rank: 0,
    priority: 'High',
    title: 'Your income',
    why: 'Everything in the plan starts here',
  },
  costsM: {
    rank: 0,
    priority: 'High',
    title: 'Monthly living costs',
    why: 'Shows how much you can save',
  },
  pension: {
    rank: 1,
    priority: 'High',
    title: 'Pension value',
    why: 'The biggest tool for retiring early',
  },
  cash: { rank: 2, priority: 'High', title: 'Cash savings', why: 'A head start for your pot' },
  sp: { rank: 3, priority: 'High', title: 'State Pension record', why: '' },
  mortBal: { rank: 3.5, priority: 'High', title: 'Mortgage', why: 'Your biggest monthly cost' },
  cardBal: LOANS,
  loanBal: LOANS,
  invest: { rank: 5, priority: 'Medium', title: 'Investments', why: 'Part of your net worth' },
  pensionM: {
    rank: 6,
    priority: 'Medium',
    title: 'Monthly pension payments',
    why: 'What you add each month',
  },
  life: PROTECTION,
  ip: PROTECTION,
}

export function completeness(context: ReportContext) {
  const { plan } = context
  const items = checkItems({ ...plan, warnings: withRepaymentLooks(plan) })
  const missing = items.filter(needsAttention)
  const seen = new Set<string>()
  const nextToAdd = missing
    .flatMap(({ key }) => (NEXT_TO_ADD[key] ? [{ key, ...NEXT_TO_ADD[key] }] : []))
    .filter((item) => !seen.has(item.title) && seen.add(item.title))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 4)
    .map(({ key, title, why, priority }) => ({
      title,
      sub:
        key === 'sp'
          ? `Up to ${euro(context.statePensionYear)} a year from ${context.statePensionAge}`
          : why,
      priority,
    }))
  return { have: items.length - missing.length, total: items.length, items: nextToAdd }
}
