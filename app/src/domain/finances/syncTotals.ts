// Balance-sheet totals in fin follow the list items (cards, loans, other mortgages, pensions).
import { hasValue } from '../../lib/format.ts'
import type { ListItem, Plan } from '../../state/types.ts'
import { LISTS } from './lists.data.ts'

type PlanTotals = Pick<Plan, 'lists' | 'fin' | 'src' | 'conf' | 'fix' | 'listsFedTotals'>

const DEBT_LISTS = ['cards', 'loans', 'mort2'] as const

type FieldSum = {
  total: number
  fromDocs: boolean
  confidence?: number
  fixed: boolean
}

const isNumber = (item: ListItem, field: string) =>
  hasValue(item.f[field]) && !isNaN(+item.f[field])
const isPositive = (item: ListItem, field: string) => hasValue(item.f[field]) && +item.f[field] > 0

function sumField(items: ListItem[], field: string): FieldSum | null {
  const filled = items.filter((item) => isNumber(item, field))
  if (!filled.length) return null
  const fromDocs = filled.every((item) => item.src[field] === 'doc')
  const allRated = filled.every((item) => item.conf[field] != null)
  return {
    total: filled.reduce((sum, item) => sum + +item.f[field], 0),
    fromDocs,
    confidence:
      fromDocs && allRated ? Math.min(...filled.map((item) => item.conf[field])) : undefined,
    fixed: fromDocs && items.some((item) => item.src[field] === 'doc' && item.fix[field]),
  }
}

function clearTotal(plan: PlanTotals, key: string) {
  delete plan.fin[key]
  delete plan.src[key]
  delete plan.conf[key]
  delete plan.fix[key]
}

function writeTotal(plan: PlanTotals, key: string, sum: FieldSum | null) {
  if (!sum) return clearTotal(plan, key)
  plan.fin[key] = sum.total
  plan.src[key] = sum.fromDocs ? 'doc' : 'typed'
  if (sum.confidence === undefined) delete plan.conf[key]
  else plan.conf[key] = sum.confidence
  if (sum.fixed) plan.fix[key] = true
  else delete plan.fix[key]
}

// Rates averaged by the amount owed; an item with nothing owed counts once.
function averageRate(items: ListItem[]): number | null {
  const rated = items.filter((item) => isPositive(item, 'rate'))
  if (!rated.length) return null
  const weight = (item: ListItem) => (+item.f.owed > 0 ? +item.f.owed : 1)
  const totalWeight = rated.reduce((sum, item) => sum + weight(item), 0)
  const weighted = rated.reduce((sum, item) => sum + +item.f.rate * weight(item), 0)
  return +(weighted / totalWeight).toFixed(4)
}

type DebtKeys = (typeof LISTS)[(typeof DEBT_LISTS)[number]]['totals']

function syncDebt(plan: PlanTotals, items: ListItem[], keys: DebtKeys) {
  writeTotal(plan, keys.owed, sumField(items, 'owed'))
  writeTotal(plan, keys.pay, sumField(items, 'pay'))
  // the averaged rate keeps any confidence or fix flag a document left on it
  const rate = averageRate(items)
  if (rate != null) {
    plan.fin[keys.rate] = rate
    plan.src[keys.rate] = 'typed'
  } else if (plan.src[keys.rate] === 'typed') {
    delete plan.fin[keys.rate]
    delete plan.src[keys.rate]
  }
}

// The customer's own monthly contribution: typed per pension, capped at its monthly total;
// a pension with no typed share uses ownShare from Your assumptions.
function ownContribution(items: ListItem[], ownShare: number): number | null {
  const paying = items.filter((item) => isPositive(item, 'monthly'))
  const typed = paying.filter((item) => hasValue(item.f.own))
  if (!typed.length) return null
  const blank = paying.filter((item) => !hasValue(item.f.own))
  const typedTotal = typed.reduce((sum, item) => sum + Math.min(+item.f.own, +item.f.monthly), 0)
  const blankTotal = blank.reduce((sum, item) => sum + +item.f.monthly * ownShare, 0)
  return typedTotal + blankTotal
}

function syncPensions(plan: PlanTotals, items: ListItem[], ownShare: number) {
  const keys = LISTS.pens.totals
  writeTotal(plan, keys.value, sumField(items, 'value'))
  writeTotal(plan, keys.monthly, sumField(items, 'monthly'))
  const ownSum = sumField(items, 'own')
  const own = ownContribution(items, ownShare)
  writeTotal(plan, keys.own, ownSum && own != null ? { ...ownSum, total: own } : null)
}

/** Feeds each list's totals; a list that fed them and is now empty clears them. Mutates (an immer draft). */
export function syncTotals(plan: PlanTotals, ownShare: number) {
  if (!plan.lists) return
  const fed = (plan.listsFedTotals ||= {})
  for (const list of [...DEBT_LISTS, 'pens'] as const) {
    const keys = LISTS[list].totals
    const items = (plan.lists[list] ||= [])
    if (items.length) {
      fed[list] = true
      if (list === 'pens') syncPensions(plan, items, ownShare)
      else syncDebt(plan, items, LISTS[list].totals)
    } else if (fed[list]) {
      Object.values(keys).forEach((key) => clearTotal(plan, key))
      fed[list] = false
    }
  }
}
