// The customer's figures as numbers. Skipped figures count as 0 (we never fill one in).
import { hasValue, isNumber, toNumber } from '../../lib/format'
import { assumption, chosenAssumption, isChosen } from './assumptions'
import { debts, homeMortgage, statedRate } from './loans'
import type { DebtFinances, DebtInputs, Figure } from './loans'
import { canAutoEnrol, partnerStatePension, statePensionFraction } from './pensions'
import type { Rules } from './rates'

// figures used as typed: our name, then the field the customer filled in
const TYPED_FIGURES = {
  otherIncomeMonthly: 'otherM',
  monthlyCosts: 'costsM',
  yearlyOneOffs: 'oneOffY',
  cash: 'cash',
  invest: 'invest',
  monthlyRentReceived: 'rentM',
  savings: 'savings',
  otherAssets: 'otherAssets',
  alternativeInvestments: 'altInv',
  downsizeAge: 'downAge',
  downsizeValue: 'downValue',
  policyLumpSum: 'polLump',
  policyLumpSumAge: 'polLumpAge',
  policyIncome: 'polInc',
  policyIncomeAge: 'polIncAge',
  pension: 'pension',
} as const

type FigureKey =
  | (typeof TYPED_FIGURES)[keyof typeof TYPED_FIGURES]
  | 'pAge'
  | 'mortBal'
  | 'mortYears'
  | 'mortPayM'
  | 'pensionM'
  | 'pensionOwnM'
  | 'spYears'
  | 'penChg'
  | 'homeValue'

/** Everything householdFigures reads from the customer's finances. */
export type Finances = DebtFinances &
  Partial<Record<FigureKey, Figure>> & { home?: string; homeUse?: string; ae?: string }

export interface Household extends DebtInputs {
  figures: Finances
  about: {
    age: number | null
    partner: boolean | null
    married?: boolean | null
    dependants: number | null
    taxCredits?: Record<string, boolean>
  }
  retireAge: number
  partnerRetireAge?: number
  partnerRetireSet?: boolean
}

const typedFigures = (fin: Finances) =>
  Object.fromEntries(
    Object.entries(TYPED_FIGURES).map(([name, key]) => [name, toNumber(fin[key])]),
  ) as Record<keyof typeof TYPED_FIGURES, number>

/** Expects lists already synced. */
export function householdFigures(household: Household, rules: Rules) {
  const { about, figures, assumptions } = household
  const assumed = (key: string) => assumption(household, key)
  const age = about.age
  const work = figures.work || (toNumber(figures.income) > 0 ? 'Employed' : undefined)
  const working = work !== 'Not working'
  const ownsHome = figures.home?.startsWith('Own') ?? false
  const mortgageRate = statedRate(household, 'mortRate')
  const mortgage = homeMortgage(figures, mortgageRate)
  const income = working ? toNumber(figures.income) : 0
  const monthlyPension = working && income > 0 ? toNumber(figures.pensionM) : 0
  const monthlyOwnPension = isNumber(figures.pensionOwnM)
    ? Math.min(monthlyPension, Number(figures.pensionOwnM))
    : monthlyPension * assumed('ownShare')

  // without contribution years, the customer's own weekly amount gives the share
  const spYears = hasValue(figures.spYears)
    ? figures.spYears
    : chosenAssumption(assumptions, 'spYears')
  const weeklyShare = (key: string) => Math.min(1, assumed(key) / rules.sp.week)
  const fullStatePension = figures.sp === 'Expect full' ? 1 : weeklyShare('spWeek')
  const statePensionShare =
    spYears != null ? statePensionFraction(rules, Number(spYears)) : fullStatePension

  const partnerStatePensionOption = about.partner ? figures.pSp || 'Not sure' : 'None'
  const partnerStatePensionShare = partnerStatePension(partnerStatePensionOption, () =>
    weeklyShare('pSpWeek'),
  )

  const autoEnrolmentEligible =
    work === 'Employed' && monthlyPension === 0 && canAutoEnrol(rules, age, income)
  const credits = about.taxCredits || {}
  const married = !!about.partner && about.married === true
  // the standard pension growth assumes typical charges; a statement's own charges replace them
  const pensionGrowth = isNumber(figures.penChg)
    ? assumed('pen') + assumed('penChg') - Number(figures.penChg) / 100
    : assumed('pen')

  return {
    age,
    retireAge: household.retireAge,
    work,
    married,
    partner: !!about.partner,
    partnerAge: about.partner ? toNumber(figures.pAge) || age : 0,
    partnerRetireAge: household.partnerRetireSet ? household.partnerRetireAge : 0,
    income,
    partnerIncome: about.partner ? toNumber(figures.pIncome) : 0,
    ...typedFigures(figures),
    homeValue: ownsHome ? toNumber(figures.homeValue) : 0,
    homeUse: ownsHome ? figures.homeUse || 'No, never' : 'No, never',

    mortgageBalance: mortgage.balance,
    mortgageRate,
    mortgageRateKnown: toNumber(figures.mortRate) > 0 || isChosen(assumptions, 'mortRate'),
    monthlyMortgage: mortgage.monthly,
    mortgageEstimated: mortgage.estimated,
    mortgageTermKnown: mortgage.termKnown,
    mortgagePaymentLow: mortgage.paymentLow,
    mortgageYears: mortgage.years,
    ...debts(household),

    monthlyPension,
    monthlyOwnPension,
    pensionGrowth,
    statePensionShare,
    statePensionKnown:
      spYears != null || figures.sp === 'Expect full' || isChosen(assumptions, 'spWeek'),
    partnerStatePensionShare,
    partnerStatePensionOption,
    autoEnrolled: autoEnrolmentEligible && figures.ae !== 'No',
    autoEnrolmentEligible,

    rentCredit: !!credits.rent && figures.home === 'Rent',
    singleParentCredit: !!credits.lone && (about.dependants ?? 0) > 0 && !about.partner,
    homeCarerCredit: !!credits.carer && married,
  }
}

export type HouseholdFigures = ReturnType<typeof householdFigures>

// essential spending a month: living costs, mortgage and loan repayments
export const essentialMonthly = (figures: HouseholdFigures) =>
  figures.monthlyCosts +
  figures.monthlyMortgage +
  (figures.debt > 0 ? figures.monthlyDebtPayment : 0)
