// Budget 2027 changes, keyed by register path, laid over the 2026 rules from 1 Jan 2027 (original RULES_2027).
import { BUDGET_2027_SOURCE, rule, type Rule } from './rates.data'

const budget2027 = <T>(value: T, effective: string, verify = false) =>
  rule(value, BUDGET_2027_SOURCE, effective, verify)

const ASSUMED_RISE =
  'Jan 2027 (+€10 assumed from the general €10 rise; the exact rate is not in the guide)'

export const RULES_2027: Record<string, Rule> = {
  'it.band': budget2027(46500, '1 Jan 2027'),
  'it.bandSPCCC': budget2027(50500, '1 Jan 2027'),
  'it.bandMarried': budget2027(55500, '1 Jan 2027'),
  'it.bandUplift': budget2027(37500, '1 Jan 2027 (two incomes up to 93,000)'),
  'it.personal': budget2027(2125, '1 Jan 2027'),
  'it.personalMarried': budget2027(4250, '1 Jan 2027'),
  'it.paye': budget2027(2125, '1 Jan 2027'),
  'it.eic': budget2027(2125, '1 Jan 2027'),
  'it.homeCarer': budget2027(2050, '1 Jan 2027'),
  'it.rent': budget2027(1150, '2027 and 2028'),
  'it.rentJoint': budget2027(2300, '2027 and 2028'),
  'usc.bands': budget2027(
    [
      [12012, 0.005],
      [30300, 0.02],
      [70044, 0.03],
      [Infinity, 0.08],
    ],
    '1 Jan 2027 (2% band now to 30,300)',
  ),
  'sp.week': budget2027(309.3, 'Jan 2027 (+€10 on weekly social welfare payments)'),
  'sp.illness': budget2027(264, ASSUMED_RISE, true),
  'sp.survivor': budget2027(269.5, ASSUMED_RISE, true),
  'sp.survivor66': budget2027(309.3, ASSUMED_RISE, true),
  'sav.exit': budget2027(
    0.35,
    '1 Jan 2027 (Investment Undertaking Tax, life assurance exit tax, equivalent offshore funds and certain foreign policies; 8-year deemed disposal stays)',
  ),
}

export const UNCHANGED_IN_2027 =
  'Not in the Budget 2027 tax measures, so 2026 figures stay: DIRT, USC rates and the 3% band, PRSI (rate path already legislated), pension relief and lump-sum limits, stamp duty, age credit, single-parent credit. The Standard Fund Threshold valuation factors are being revised (not modelled). The exact Qualified Adult rate is not in the published guide and stays at 2026.'
