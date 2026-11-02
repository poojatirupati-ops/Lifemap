// What the projection reads that stays the same from year to year: rules, figures and assumptions.
import type { Plan } from '../../state/types'
import { assumption, chosenAssumption } from './assumptions'
import { householdFigures, type Household } from './householdFigures'
import { standardFundThreshold } from './pensions'
import { rulesFor } from './rates'
import {
  GROWTH_KEYS,
  defaultSettings,
  growthRate,
  investmentGrowth,
  standardValue,
  type StandardKey,
} from './settings'

export type ProjectionInputs = Household &
  Pick<Plan, 'goals' | 'rank' | 'answers' | 'monthlySaving' | 'inflation' | 'assumptionSet'> & {
    savingAtRule?: boolean | null
    pensionExtra?: number
  }

const STANDARD_KEYS: StandardKey[] = [
  'accessAge',
  'lumpSum',
  'drawRule',
  'spGrow',
  'bands',
  'investShare',
  'cgtGain',
  'retireSpend',
  'cashYears',
  'saveShare',
  'noAnswer',
]

// TODO(R-11): assumption() knows neither the Cautious set nor these standards yet, so they are
// filled in as if chosen; the customer's own choice still wins.
function withStandards(inputs: ProjectionInputs): ProjectionInputs {
  const cautious = inputs.assumptionSet === 'cautious'
  const rules = rulesFor(assumption(inputs, 'startYear'))
  const filled: Household['assumptions'] = {
    ...Object.fromEntries(STANDARD_KEYS.map((key) => [key, standardValue(key) as number | string])),
    drawFixed: 20000,
    ...(cautious &&
      Object.fromEntries(GROWTH_KEYS.map((key) => [key, growthRate(key, 'cautious')]))),
    inv: investmentGrowth(defaultSettings, cautious ? 0.01 : 0, rules),
  }
  for (const key of Object.keys(inputs.assumptions))
    if (chosenAssumption(inputs.assumptions, key) != null) filled[key] = inputs.assumptions[key]
  return { ...inputs, assumptions: filled }
}

/** Everything the projection reads that stays the same from year to year. */
export function planSettings(plan: ProjectionInputs) {
  const inputs = withStandards(plan)
  const value = (key: string) => assumption(inputs, key)
  const choice = (key: string) => String(inputs.assumptions[key])
  const startYear = value('startYear')
  const rules = rulesFor(startYear)
  const inflation = plan.inflation ?? (standardValue('infl') as number)
  return {
    inputs,
    rules,
    startYear,
    figures: householdFigures(inputs, rules),
    end: value('planEnd'),
    growth: {
      inflation,
      wage: value('wage'),
      cash: value('cash'),
      invest: value('inv'),
      pensionRetired: value('penRet'),
    },
    accessAge: value('accessAge'),
    lumpShare: value('lumpSum'),
    drawRule: choice('drawRule'),
    drawFixed: value('drawFixed'),
    statePensionGrowth: choice('spGrow'),
    flatBands: choice('bands') === 'flat',
    investShare: value('investShare'),
    gainsTax: rules.sav.cgt * value('cgtGain'),
    retireSpend: value('retireSpend'),
    saving: { share: value('saveShare'), noAnswer: value('noAnswer') },
    bufferMonths: value('safetyMonths'),
    cashYears: value('cashYears'),
    extraPension: Number(plan.pensionExtra || 0),
    statePension: rules.sp.week * rules.sp.weeks,
    sftAt: (year: number) => standardFundThreshold(rules, year, inflation),
  }
}

export type PlanSettings = ReturnType<typeof planSettings>
