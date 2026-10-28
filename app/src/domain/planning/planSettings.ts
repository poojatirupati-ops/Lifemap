// What the projection reads that stays the same from year to year: rules, figures and assumptions.
import type { Plan } from '../../state/types'
import { assumption, chosenAssumption } from './assumptions'
import { householdFigures, type Household } from './householdFigures'
import { standardFundThreshold } from './pensions'
import { rulesFor, type Rules } from './rates'
import { cautiousValue, standardValue, type StandardKey } from './settings'

export type ProjectionInputs = Household &
  Pick<Plan, 'goals' | 'rank' | 'ans' | 'saveM' | 'infl' | 'assume'> & {
    saveUp?: boolean | null
    penExtra?: number
  }

const GROWTH_KEYS: StandardKey[] = ['wage', 'cash', 'inv', 'pen', 'penRet']
const STANDARD_KEYS = [
  ...['accessAge', 'lumpSum', 'drawRule', 'spGrow', 'bands', 'investShare', 'cgtGain'],
  ...['retireSpend', 'cashYears', 'saveShare', 'noAnswer'],
] as StandardKey[]

// TODO(R-11): investmentGrowth() (settings.ts) always uses the 2026 exit tax; the original uses the
// plan year's. Move this there.
function investmentGrowth(rules: Rules, cut: number) {
  const gross = (standardValue('invGross') as number) - cut
  const charges = (standardValue('fundChg') as number | undefined) ?? 0.01
  const { deemed: years, exit: tax } = rules.sav
  const grown = (1 + gross - charges) ** years
  const afterTax = grown - tax * (grown - 1)
  return Math.round((afterTax ** (1 / years) - 1) * 1000) / 1000
}

// TODO(R-11): assumption() knows neither the Cautious set nor these standards yet, so they are
// filled in as if chosen; the customer's own choice still wins.
function withStandards(inputs: ProjectionInputs): ProjectionInputs {
  const cautious = inputs.assume === 'cautious'
  const rules = rulesFor(assumption(inputs, 'startYear'))
  const filled: Household['asm'] = {
    ...Object.fromEntries(STANDARD_KEYS.map((key) => [key, standardValue(key) as number | string])),
    drawFixed: 20000,
    ...(cautious &&
      Object.fromEntries(GROWTH_KEYS.map((key) => [key, cautiousValue(key) as number]))),
    inv: investmentGrowth(rules, cautious ? 0.01 : 0),
  }
  for (const key of Object.keys(inputs.asm))
    if (chosenAssumption(inputs.asm, key) != null) filled[key] = inputs.asm[key]
  return { ...inputs, asm: filled }
}

/** Everything the projection reads that stays the same from year to year. */
export function planSettings(plan: ProjectionInputs) {
  const inputs = withStandards(plan)
  const value = (key: string) => assumption(inputs, key)
  const choice = (key: string) => String(inputs.asm[key])
  const startYear = value('startYear')
  const rules = rulesFor(startYear)
  const inflation = plan.infl ?? (standardValue('infl') as number)
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
    extraPension: Number(plan.penExtra || 0),
    statePension: rules.sp.week * rules.sp.weeks,
    sftAt: (year: number) => standardFundThreshold(rules, year, inflation),
  }
}

export type PlanSettings = ReturnType<typeof planSettings>
