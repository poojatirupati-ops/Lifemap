// What the projection reads that stays the same from year to year: rules, figures and assumptions.
import type { Plan } from '../../state/types'
import { assumedValue, assumption } from './assumptions'
import { householdFigures, type Household } from './householdFigures'
import { standardFundThreshold } from './pensions'
import { rulesFor } from './rates'
import { standardValue } from './settings'

export type ProjectionInputs = Household &
  Pick<Plan, 'goals' | 'rank' | 'answers' | 'monthlySaving' | 'inflation' | 'assumptionSet'> & {
    savingAtRule?: boolean | null
    pensionExtra?: number
  }

/** Everything the projection reads that stays the same from year to year. */
export function planSettings(inputs: ProjectionInputs) {
  const value = (key: string) => assumption(inputs, key)
  const choice = (key: string) => String(assumedValue(inputs, key))
  const startYear = value('startYear')
  const rules = rulesFor(startYear)
  const inflation = inputs.inflation ?? (standardValue('infl') as number)
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
    extraPension: Number(inputs.pensionExtra || 0),
    statePension: rules.sp.week * rules.sp.weeks,
    sftAt: (year: number) => standardFundThreshold(rules, year, inflation),
  }
}

export type PlanSettings = ReturnType<typeof planSettings>
