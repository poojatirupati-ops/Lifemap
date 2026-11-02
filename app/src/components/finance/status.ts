// Where each finance figure came from, and how far along each section of Your finances is.
import { FINANCE_SECTIONS, type FinanceSection } from '../../domain/finances/sections.data.ts'
import { isChosen } from '../../domain/planning/assumptions.ts'
import { euro, hasValue } from '../../lib/format.ts'
import type { Plan, Provenance } from '../../state/types.ts'
import {
  FINANCE_FIELDS,
  fieldValue,
  isFieldVisible,
  type FieldContext,
} from '../../domain/finances/fields.data.ts'

export type FinancePlan = FieldContext & Pick<Plan, 'sources' | 'assumptions' | 'warnings' | 'acknowledged' | 'savedSections'>
export type SectionStatus = 'done' | 'look' | 'part' | 'none'

const RATES_YOU_CAN_CHOOSE = ['mortRate', 'cardRate', 'loanRate']

const isPositive = (value: unknown) => hasValue(value) && +value! > 0

// an other-property mortgage with neither a repayment nor a term still needs one
const otherMortgageNeedsTerm = ({ lists }: Pick<Plan, 'lists'>) =>
  (lists?.mort2 ?? []).some(
    ({ fields: f }) => isPositive(f.owed) && !isPositive(f.pay) && !isPositive(f.years),
  )

/** Where a figure came from; a rate chosen in Your assumptions counts as typed. */
export function fieldSource(key: string, plan: FinancePlan): Provenance | undefined {
  if (key === 'mort2') return otherMortgageNeedsTerm(plan) ? undefined : 'typed'
  if (plan.sources[key]) return plan.sources[key]
  if (RATES_YOU_CAN_CHOOSE.includes(key) && isChosen(plan.assumptions, key)) return 'typed'
}

export const visibleFields = (section: FinanceSection, plan: FieldContext) =>
  section.fields.filter((key) => isFieldVisible(key, plan))

export const requiredFields = (section: FinanceSection, plan: FieldContext) =>
  visibleFields(section, plan).filter((key) => !FINANCE_FIELDS[key].optional)

export function sectionStatus(section: FinanceSection, plan: FinancePlan): SectionStatus {
  const fields = visibleFields(section, plan)
  if (fields.some((key) => plan.warnings[key] && !plan.acknowledged[key])) return 'look'
  // a saved section is complete: its blanks count as €0
  if (
    requiredFields(section, plan).every((key) => fieldSource(key, plan)) ||
    plan.savedSections[section.id]
  )
    return 'done'
  const enteredByCustomer = fields.some((key) => {
    const source = fieldSource(key, plan)
    return source && source !== 'pre'
  })
  return enteredByCustomer ? 'part' : 'none'
}

const sectionById = (id: string) => FINANCE_SECTIONS.find((section) => section.id === id)!

const isSectionDone = (id: string, plan: FinancePlan) =>
  ['done', 'look'].includes(sectionStatus(sectionById(id), plan))

/** Enough to see results: About you, Income, and Assets or Pension. */
export const hasMinimumFinances = (plan: FinancePlan) =>
  isSectionDone('about', plan) &&
  isSectionDone('income', plan) &&
  (isSectionDone('assets', plan) || isSectionDone('pension', plan))

/** Sections with nothing entered at all. */
export const skippedSections = (plan: FinancePlan) =>
  FINANCE_SECTIONS.filter((section) => {
    const fields = visibleFields(section, plan)
    return fields.length && fields.every((key) => !fieldSource(key, plan) && !plan.warnings[key])
  })

/** €58,000, Employed, or — when blank. */
export function formatField(key: string, plan: Pick<Plan, 'figures'>) {
  const value = fieldValue(key, plan)
  if (value == null || value === '') return '—'
  return FINANCE_FIELDS[key].type === 'eur' ? euro(+value) : String(value)
}

const EMPTY_SUMMARY: Record<string, string> = {
  about: 'Name, age, retirement age',
  prot: 'Yes or no for each · about 1 min',
}

/** The first three figures entered, or what the section asks for. */
export function sectionSummary(section: FinanceSection, plan: FinancePlan) {
  const filled = visibleFields(section, plan).filter(
    (key) => fieldSource(key, plan) && hasValue(plan.figures[key]),
  )
  if (!filled.length) return EMPTY_SUMMARY[section.id] ?? 'Upload or type it · about 1 min'
  return filled
    .slice(0, 3)
    .map((key) => `${FINANCE_FIELDS[key].label.replace(/^Your /, '')}: ${formatField(key, plan)}`)
    .join(' · ')
}
