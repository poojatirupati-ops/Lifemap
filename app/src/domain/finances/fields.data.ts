// Every Your finances field: its label, input type and when it shows.
import { LAW_TEXT, rules2026 } from '../planning/rates.ts'
import { hasValue, toNumber } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'

type FieldType = 'text' | 'num' | 'eur' | 'pct' | 'choice' | 'ynn'

export type FieldContext = Pick<Plan, 'figures' | 'about' | 'partner' | 'lists'>

type FinanceField = {
  label: string
  type: FieldType
  options?: string[]
  hint?: string
  min?: number
  max?: number
  optional?: true
  /** Filled from the customer's earlier answers. */
  prefilled?: true
  /** A total across list items (cards, loans, pensions). */
  fromList?: true
  /** Not stored in fin: "Do you have a mortgage?" follows Your home. */
  virtual?: true
  visible?: (plan: FieldContext) => boolean
}

export const ownsHome = ({ figures }: Pick<Plan, 'figures'>) => /^Own/.test(figures.home || '')
const hasMortgage = ({ figures }: FieldContext) => figures.home === 'Own with mortgage'
const downsizing = (plan: FieldContext) =>
  ownsHome(plan) && plan.figures.homeUse === "Yes, I'd downsize"
/** A partner whose income counts in the plan. */
export const partnerEarns = ({ about, figures }: Pick<Plan, 'about' | 'figures'>) =>
  !!about.partner && toNumber(figures.pIncome) > 0
const YES_NO_NOT_SURE = ['Yes', 'No', 'Not sure']
const { ae } = rules2026

const autoEnrolmentApplies = ({ figures, about }: FieldContext) =>
  figures.work === 'Employed' &&
  about.age != null &&
  about.age >= ae.ageMin &&
  about.age <= ae.ageMax &&
  +figures.income > ae.earnMin &&
  !(+figures.pensionM > 0)

const otherMortgageOwed = ({ lists }: FieldContext) =>
  (lists?.mort2 ?? []).some((item) => hasValue(item.fields.owed) && +item.fields.owed > 0)

// Each section's fields, in the order they show.
export const SECTION_FIELDS = {
  about: {
    name: { label: 'First name', type: 'text', prefilled: true },
    // with a date of birth the age comes from it
    age: {
      label: 'Your age',
      type: 'num',
      min: 18,
      max: 80,
      prefilled: true,
      visible: ({ about }) => !about.dob,
    },
    retireAge: {
      label: 'Retirement age',
      type: 'num',
      prefilled: true,
      hint: 'From your timeline flag',
    },
    // the partner's date of birth is optional when they have no income
    pAge: { label: "Partner's age", type: 'num', min: 18, max: 85, visible: partnerEarns },
  },
  income: {
    work: {
      label: 'Your work',
      type: 'choice',
      options: ['Employed', 'Self-employed', 'Not working'],
    },
    income: { label: 'Your gross yearly income', type: 'eur', hint: 'Before tax' },
    pIncome: {
      label: "Partner's gross yearly income",
      type: 'eur',
      visible: ({ about, partner }) => !!about.partner && partner.mode !== 'invite',
    },
    otherM: {
      label: 'Other income a month (before tax)',
      type: 'eur',
      optional: true,
      hint: 'Optional. Taxed with your other income',
    },
    costsM: {
      label: 'Monthly living costs',
      type: 'eur',
      hint: 'Rent, bills, food and extras. Leave out mortgage and loan repayments.',
    },
    oneOffY: {
      label: 'Yearly one-off costs',
      type: 'eur',
      optional: true,
      hint: 'Optional. Car tax, insurance, holidays',
    },
  },
  assets: {
    home: {
      label: 'Your home',
      type: 'choice',
      options: ['Own outright', 'Own with mortgage', 'Rent', 'Live with family'],
    },
    homeValue: { label: 'Home value', type: 'eur', visible: ownsHome },
    homeUse: {
      label: 'Would you ever use your home to fund your plan?',
      type: 'choice',
      options: ['No, never', "Yes, I'd downsize", 'Only as a last resort'],
      optional: true,
      visible: ownsHome,
    },
    downAge: {
      label: 'Age you would downsize',
      type: 'num',
      min: 50,
      max: 95,
      optional: true,
      visible: downsizing,
    },
    downValue: {
      label: "Value of the smaller home (today's money)",
      type: 'eur',
      optional: true,
      visible: downsizing,
    },
    cash: {
      label: 'Cash savings',
      type: 'eur',
      hint: 'Current account and easy-access savings, incl. credit union',
    },
    savings: {
      label: 'Savings accounts',
      type: 'eur',
      optional: true,
      hint: 'Optional. Deposit, notice and fixed-term accounts, State Savings',
    },
    invest: { label: 'Investments', type: 'eur', hint: 'Shares, funds, share schemes: one total' },
    otherAssets: {
      label: 'Other assets you would sell if needed',
      type: 'eur',
      optional: true,
      hint: 'Optional. For example land or a business share. Not your home, and not property you rent out',
    },
    altInv: {
      label: 'Alternative investments',
      type: 'eur',
      optional: true,
      hint: 'Optional. Crypto, gold, art, collectables',
    },
    propValue: { label: 'Other property: value', type: 'eur', optional: true, hint: 'Optional' },
    rentM: {
      label: 'Other property: rent received a month (before tax)',
      type: 'eur',
      optional: true,
      hint: 'Optional. Rental profit is taxed at your marginal rate, with USC and PRSI',
    },
  },
  liab: {
    mortYN: {
      label: 'Do you have a mortgage?',
      type: 'choice',
      options: ['Yes', 'No'],
      optional: true,
      virtual: true,
    },
    mortBal: { label: 'Mortgage left', type: 'eur', visible: hasMortgage },
    mortPayM: { label: 'Monthly repayment', type: 'eur', visible: hasMortgage },
    mortYears: { label: 'Years left', type: 'num', min: 1, max: 40, visible: hasMortgage },
    mortRate: {
      label: 'Interest rate, APR %',
      type: 'pct',
      visible: hasMortgage,
      hint: 'Your statement shows it. If you leave it blank we use the Central Bank average and say so: "Assumed: add yours"',
    },
    cardBal: { label: 'Credit cards: total owed', type: 'eur', fromList: true },
    cardPayM: { label: 'Credit cards: monthly repayment', type: 'eur', fromList: true },
    cardRate: {
      label: 'Credit cards: interest rate (APR %)',
      type: 'pct',
      fromList: true,
      visible: ({ figures }) => toNumber(figures.cardBal) > 0,
    },
    loanBal: {
      label: 'Other loans (car, personal, credit union): total owed',
      type: 'eur',
      fromList: true,
    },
    loanPayM: { label: 'Other loans: monthly repayment', type: 'eur', fromList: true },
    loanRate: {
      label: 'Other loans: interest rate (APR %)',
      type: 'pct',
      fromList: true,
      visible: ({ figures }) => toNumber(figures.loanBal) + toNumber(figures.debt) > 0,
    },
    mort2: {
      label: 'Other-property mortgage: years left or repayment',
      type: 'num',
      fromList: true,
      visible: otherMortgageOwed,
    },
  },
  prot: {
    life: { label: 'Life cover', type: 'ynn' },
    ip: { label: 'Income protection', type: 'ynn' },
    ci: { label: 'Serious illness cover', type: 'ynn' },
    workCover: { label: 'Cover through work', type: 'ynn' },
    health: { label: 'Health insurance', type: 'ynn' },
  },
  pension: {
    pension: { label: 'Pension value today', type: 'eur', hint: 'All pots together', fromList: true },
    pensionM: {
      label: 'Paid in each month',
      type: 'eur',
      hint: 'Including your employer',
      fromList: true,
    },
    pensionOwnM: {
      label: 'Of that, paid by you each month',
      type: 'eur',
      optional: true,
      hint: 'Optional. Only your own share gets tax relief. If you leave it blank, you choose your share in Your assumptions',
      fromList: true,
      visible: ({ figures }) => +figures.pensionM > 0 && figures.work !== 'Not working',
    },
    ae: {
      label: 'Have you been auto-enrolled in My Future Fund?',
      type: 'choice',
      options: YES_NO_NOT_SURE,
      optional: true,
      hint: `${LAW_TEXT.autoEnrolment} Set by law, so we count you in unless you say no`,
      visible: autoEnrolmentApplies,
    },
    sp: {
      label: 'State Pension',
      type: 'choice',
      options: ['Expect full', 'Partly', 'Not sure'],
      hint: `${LAW_TEXT.statePension} Check your record on MyWelfare`,
    },
    pSp: {
      label: "Your partner's State Pension",
      type: 'choice',
      options: ['Own full', 'Own partial', 'Qualified adult increase', 'None', 'Not sure'],
      optional: true,
      visible: ({ about }) => !!about.partner,
      hint: 'Optional. A partner without their own State Pension may get a Qualified Adult increase on yours (means-tested)',
    },
    polLump: {
      label: 'Savings or endowment policy: amount it pays out',
      type: 'eur',
      optional: true,
      hint: 'Optional. As shown on the policy, after any tax',
    },
    polLumpAge: {
      label: 'Your age when it pays out',
      type: 'num',
      min: 18,
      max: 100,
      optional: true,
      visible: ({ figures }) => toNumber(figures.polLump) > 0,
    },
    polInc: {
      label: 'Policy or annuity paying a regular income: € a year',
      type: 'eur',
      optional: true,
      hint: "Optional. Before tax. For example a guaranteed income plan or annuity. Income protection (cover if you can't work) goes under Protection",
    },
    polIncAge: {
      label: 'Your age when it starts',
      type: 'num',
      min: 18,
      max: 100,
      optional: true,
      visible: ({ figures }) => toNumber(figures.polInc) > 0,
    },
  },
} satisfies Record<string, Record<string, FinanceField>>

export const FINANCE_FIELDS: Record<string, FinanceField> = Object.assign(
  {},
  ...Object.values(SECTION_FIELDS),
)

export const isFieldVisible = (key: string, plan: FieldContext) =>
  FINANCE_FIELDS[key].visible?.(plan) ?? true

/** "Do you have a mortgage?" answers from Your home when they own it. */
export function mortgageAnswer({ figures }: Pick<Plan, 'figures'>): string | null {
  if (figures.home === 'Own with mortgage') return 'Yes'
  if (figures.home === 'Own outright') return 'No'
  return figures.mortYN || null
}

/** A field's value as stored, or the mortgage answer for the virtual field. */
export const fieldValue = (key: string, plan: Pick<Plan, 'figures'>) =>
  key === 'mortYN' ? mortgageAnswer(plan) : plan.figures[key]

/** Where to look up a field's source: the mortgage answer comes from Your home when they own it. */
export const fieldSourceKey = (key: string, plan: Pick<Plan, 'figures'>) =>
  key === 'mortYN' && ownsHome(plan) ? 'home' : key
