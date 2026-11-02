// The "Your assumptions" items the calculators read (fields from Your assumptions), with how each
// is named in "Choose your …" and how it is set until the customer chooses (§14).
import { ASSUMPTIONS as FIELDS, type AssumptionField } from '../planning/assumptionFields.data.ts'

// TODO(R-26): planEnd has no field on Your assumptions yet
const PLAN_END: AssumptionField = {
  group: 'length',
  label: 'Plan until age (life expectancy)',
  kind: 'age',
  min: 50,
  max: 100,
  step: 1,
}

export const fieldOf = (key: string) => (key === 'planEnd' ? PLAN_END : FIELDS[key])

/** standard: LifeMap's figure, used from the start. market: a published rate, else assumed. range: a usual range. own: the customer's alone. */
export function kindOf(key: string) {
  const field = fieldOf(key)
  if (field.standard) return 'standard'
  if (field.market) return 'market'
  if (field.range) return 'range'
  return 'own'
}

/** How a missing assumption is named: "Choose your mortgage rate". */
export const ASSUMPTION_NAMES: Record<string, string> = {
  invGross: 'growth before fees',
  cash: 'cash growth',
  pen: 'pension growth',
  penRet: 'pension growth once retired',
  wage: 'pay rises',
  rentRise: 'rent rises',
  houseGrow: 'house price growth',
  upkeep: 'upkeep',
  buyFees: 'buying fees',
  depEarn: "the deposit's earning rate",
  riskMu1: 'the Cautious style growth',
  riskMu2: 'the Balanced style growth',
  riskMu3: 'the Growth style growth',
  riskVol1: 'the Cautious style ups and downs',
  riskVol2: 'the Balanced style ups and downs',
  riskVol3: 'the Growth style ups and downs',
  retireMult: 'retirement savings target',
  lumpSum: 'retirement lump sum',
  accessAge: 'pension access age',
  ddTiming: 'withdrawal timing',
  safetyMonths: 'emergency fund months',
  mortRate: 'mortgage rate',
  cardRate: 'credit-card rate',
  loanRate: 'loan rate',
  lifeShare: 'share of income your family would need',
  lifeYears: 'years of support',
  survivor: "survivor's pension",
  budgetNeeds: 'budget split',
  budgetWants: 'budget split',
  budgetSave: 'budget split',
  planEnd: 'plan-until age',
}
