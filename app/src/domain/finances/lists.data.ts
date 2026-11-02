// Repeatable items in Your finances (cards, loans, pensions, policies) and the fields each one asks for.
type ListFieldType = 'eur' | 'num' | 'pct' | 'text'

type ListField = { label: string; type: ListFieldType; optional?: true; hint?: string }

type ListDefinition = {
  section: string
  emoji?: string
  title?: string
  isPolicy?: true
  singular: string
  addLabel: string
  fields: string[]
  // item field -> the finances key that holds the total across items
  totals?: Record<string, string>
  uploadLabel: string
}

const OPTIONAL_RATE: ListField = {
  label: 'Interest rate, APR % (optional)',
  type: 'pct',
  optional: true,
}
const OPTIONAL_LENDER: ListField = { label: 'Lender (optional)', type: 'text', optional: true }
const POLICY_YEARS_LEFT: ListField = {
  label: 'Years left on the policy',
  type: 'num',
  optional: true,
}

// keyed "list.field"
export const LIST_FIELDS: Record<string, ListField> = {
  'cards.owed': { label: 'Owed on this card', type: 'eur' },
  'cards.pay': { label: 'Monthly repayment on this card', type: 'eur' },
  'cards.lender': OPTIONAL_LENDER,
  'cards.rate': OPTIONAL_RATE,
  'mort2.owed': { label: 'Mortgage left on this property', type: 'eur' },
  'mort2.pay': { label: 'Monthly repayment on this mortgage', type: 'eur' },
  'mort2.years': { label: 'Years left', type: 'num', optional: true },
  'mort2.rate': OPTIONAL_RATE,
  'loans.owed': { label: 'Owed on this loan', type: 'eur' },
  'loans.pay': { label: 'Monthly repayment on this loan', type: 'eur' },
  'loans.lender': OPTIONAL_LENDER,
  'loans.rate': OPTIONAL_RATE,
  'pens.name': { label: 'Name or provider (optional)', type: 'text', optional: true },
  'pens.value': { label: 'Value today', type: 'eur' },
  'pens.monthly': { label: 'Paid in each month, including your employer', type: 'eur' },
  'pens.own': {
    label: 'Of that, paid by you each month (optional)',
    type: 'eur',
    optional: true,
    hint: 'Only your own share gets tax relief. If you leave it blank, you choose your share in Your assumptions.',
  },
  'life.amount': { label: 'Amount covered', type: 'eur' },
  'life.term': POLICY_YEARS_LEFT,
  'ip.amount': { label: 'Monthly benefit', type: 'eur' },
  'ip.term': POLICY_YEARS_LEFT,
  'ci.amount': { label: 'Amount covered', type: 'eur' },
  'ci.term': POLICY_YEARS_LEFT,
  'workCover.amount': { label: 'Death-in-service: lump sum', type: 'eur', optional: true },
  'workCover.mult': { label: 'Or: how many times your salary', type: 'num', optional: true },
  'health.amount': { label: 'Yearly cost (optional)', type: 'eur', optional: true },
}

const policy = (
  singular: string,
  addLabel: string,
  fields: string[],
  uploadLabel = 'Upload this policy (optional)',
): ListDefinition => ({
  section: 'prot',
  isPolicy: true,
  singular,
  addLabel,
  fields,
  uploadLabel,
})

export const LISTS = {
  cards: {
    section: 'liab',
    emoji: '💳',
    title: 'Credit cards',
    singular: 'credit card',
    addLabel: '＋ Add a credit card',
    fields: ['owed', 'pay', 'lender', 'rate'],
    totals: { owed: 'cardBal', pay: 'cardPayM', rate: 'cardRate' },
    uploadLabel: "Upload this card's statement (optional)",
  },
  loans: {
    section: 'liab',
    emoji: '📄',
    title: 'Other loans (car, personal, credit union)',
    singular: 'loan',
    addLabel: '＋ Add a loan',
    fields: ['owed', 'pay', 'lender', 'rate'],
    totals: { owed: 'loanBal', pay: 'loanPayM', rate: 'loanRate' },
    uploadLabel: "Upload this loan's statement (optional)",
  },
  mort2: {
    section: 'liab',
    emoji: '🏠',
    title: 'Mortgages on other properties',
    singular: 'mortgage on another property',
    addLabel: '＋ Add a mortgage on another property',
    fields: ['owed', 'pay', 'years', 'rate'],
    totals: { owed: 'mort2Bal', pay: 'mort2PayM', rate: 'mort2Rate' },
    uploadLabel: "Upload this mortgage's statement (optional)",
  },
  pens: {
    section: 'pension',
    emoji: '🌅',
    title: 'Your pensions',
    singular: 'pension',
    addLabel: '＋ Add another pension',
    fields: ['name', 'value', 'monthly', 'own'],
    totals: { value: 'pension', monthly: 'pensionM', own: 'pensionOwnM' },
    uploadLabel: "Upload this pension's statement (optional)",
  },
  life: policy('life cover policy', '＋ Add another life cover policy', ['amount', 'term']),
  ip: policy('income protection policy', '＋ Add another income protection policy', [
    'amount',
    'term',
  ]),
  ci: policy('serious illness policy', '＋ Add another serious illness policy', ['amount', 'term']),
  workCover: policy(
    'cover through work',
    '＋ Add other cover through work',
    ['amount', 'mult'],
    'Upload your employer benefits statement (optional)',
  ),
  health: policy('health insurance plan', '＋ Add another health insurance plan', ['amount']),
} satisfies Record<string, ListDefinition>

export type ListKey = keyof typeof LISTS

/** One list's definition, with every optional part (totals, isPolicy) visible. */
export const listOf = (list: ListKey): ListDefinition => LISTS[list]

const POLICY_LISTS = new Set(
  Object.entries(LISTS)
    .filter(([, definition]) => 'isPolicy' in definition)
    .map(([list]) => list),
)
/** Life cover, income protection and the other kinds of cover each hold policies. */
export const isPolicyList = (key: string): key is ListKey => POLICY_LISTS.has(key)

// finances key -> the list and item field it totals. Rates are averaged, not totalled, and other
// mortgages have no finances field of their own to edit, so neither is listed.
export const LIST_FOR_FIELD: Record<string, [list: ListKey, field: string]> = Object.fromEntries(
  (['cards', 'loans', 'pens'] as const).flatMap((list) =>
    Object.entries(LISTS[list].totals)
      .filter(([field]) => field !== 'rate')
      .map(([field, key]) => [key, [list, field]]),
  ),
)

export const WORK_COVER_HINT =
  'How to find out: ask HR, or look in your employer benefits booklet. Death-in-service is usually a multiple of your salary. Enter what you know; leave the rest blank.'
