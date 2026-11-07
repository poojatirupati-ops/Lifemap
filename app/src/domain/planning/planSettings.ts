// What the projection reads that stays the same from year to year: rules, figures and assumptions.
import type { Plan } from '../../state/types'
import { localToday } from '../../lib/today'
import { assumedValue, assumption, holdsSharesDirectly, isChosen } from './assumptions'
import { householdFigures, type Household } from './householdFigures'
import { standardFundThreshold } from './pensions'
import { rulesFor, taxYearFor } from './rates'
import { growthAfterCharges, standardValue } from './settings'

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
  const figures = householdFigures(inputs, rules)
  const inflation = inputs.inflation ?? (standardValue('infl') as number)
  return {
    inputs,
    rules,
    startYear,
    /** the tax year whose rules every plan year uses */
    taxYear: taxYearFor(startYear),
    today: localToday(),
    figures,
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
    direct: holdsSharesDirectly(inputs),
    /** the 8-year rule is modelled unless the customer set their own investment growth */
    deemedDisposal: !isChosen(inputs.assumptions, 'inv'),
    /** investments grow by this before tax when the 8-year rule is modelled */
    investGrowthBeforeTax: growthAfterCharges(),
    gainShare: value('cgtGain'),
    assetOwners: figures.partner && figures.assetsJoint ? 2 : 1,
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
