// The 2027 tax-year configuration, keyed by register path: only the values Budget 2027 announced
// (original RULES_2027). Every other rule carries its 2026 value into 2027 as a "2026 Fallback".
// Evidence read in full on 21 Oct 2026: the Department of Finance "Budget 2027 Tax Policy Changes
// Summary" and the "Budget in Brief"; Revenue, DSP and Oireachtas pages could not be opened, so
// nothing here is "Verified".
import {
  BUDGET_2027_SOURCE,
  CITIZENS_INFO_BUDGET_2027,
  KPMG_INVESTMENT_ACCOUNT,
} from './rates.data'

export const TAX_STATUS = {
  verified: 'Verified',
  announced: 'Announced / Provisional',
  fallback: '2026 Fallback',
  toVerify: 'Requires Verification',
} as const
export type TaxStatus = (typeof TAX_STATUS)[keyof typeof TAX_STATUS]

export interface Rule2027<T = any> {
  value: T
  effective: string
  note: string
  source: string
  status: TaxStatus
}

const ZURICH_PENSIONS_2027 = 'https://www.zurich.ie/blog/pension-changes-2027/'

const announced = <T>(
  value: T,
  effective: string,
  note: string,
  source = BUDGET_2027_SOURCE,
): Rule2027<T> => ({ value, effective, note, source, status: TAX_STATUS.announced })

const STATED_INCREASE =
  'Dept of Finance summary: the increase is stated; the total is the 2026 figure plus the increase.'

export const RULES_2027: Record<string, Rule2027> = {
  'it.band': announced(
    46500,
    '1 Jan 2027',
    `Entry point for the 40% rate +€2,500. ${STATED_INCREASE}`,
  ),
  'it.bandSPCCC': announced(50500, '1 Jan 2027', `One-parent band +€2,500. ${STATED_INCREASE}`),
  'it.bandMarried': announced(
    55500,
    '1 Jan 2027',
    `Married, one income, +€2,500. ${STATED_INCREASE}`,
  ),
  'it.bandUplift': announced(
    37500,
    '1 Jan 2027',
    `Second-income increase: two incomes reach €93,000 (2 x €46,500). ${STATED_INCREASE}`,
  ),
  'it.personal': announced(2125, '1 Jan 2027', `Personal credit +€125. ${STATED_INCREASE}`),
  'it.personalMarried': announced(
    4250,
    '1 Jan 2027',
    `Married personal credit (twice the single credit). ${STATED_INCREASE}`,
  ),
  'it.paye': announced(2125, '1 Jan 2027', `Employee credit +€125. ${STATED_INCREASE}`),
  'it.eic': announced(2125, '1 Jan 2027', `Earned Income credit +€125. ${STATED_INCREASE}`),
  'it.homeCarer': announced(2050, '1 Jan 2027', `Home Carer credit +€100. ${STATED_INCREASE}`),
  'it.rent': announced(
    1150,
    '2027 and 2028',
    'Rent Tax Credit +€150 (stated with the totals in the Budget in Brief).',
  ),
  'it.rentJoint': announced(
    2300,
    '2027 and 2028',
    'Rent Tax Credit +€300 for a couple (totals stated in the Budget in Brief).',
  ),
  'usc.bands': announced(
    [
      [12012, 0.005],
      [30300, 0.02],
      [70044, 0.03],
      [Infinity, 0.08],
    ],
    '1 Jan 2027',
    'The 2% band ceiling rises from €28,700 to €30,300 (stated in the Budget in Brief). Nothing else in USC changes.',
  ),
  'sp.week': announced(
    309.3,
    'Jan 2027',
    'Weekly social welfare payments +€10 (official). €309.30 is also in adviser tables (Zurich).',
    ZURICH_PENSIONS_2027,
  ),
  'sp.iqaLimit': announced(
    340,
    '1 Jul 2027',
    'Qualified Adult income limit €310 to €340 a week from July 2027 (Citizens Information, as quoted in search results; the DSP page was not opened). A change that starts on or before 1 July applies to that whole plan year.',
    CITIZENS_INFO_BUDGET_2027,
  ),
  'sav.exit': announced(
    0.35,
    '1 Jan 2027',
    'Investment Undertaking Tax, life assurance exit tax, equivalent offshore funds and certain foreign policies 38% to 35% (official). 1 Jan 2027 is from press coverage. The 8-year deemed disposal stays.',
  ),
  'ia.start': announced(
    '2027-07-01',
    'proposed',
    'Accounts due to open 1 July 2027, subject to the Finance Bill (adviser and press coverage; the Budget says only "legislative framework").',
    KPMG_INVESTMENT_ACCOUNT,
  ),
  'ia.limit': announced(
    12000,
    'proposed',
    'Annual contribution cap per person (press coverage; Finance Bill pending).',
    KPMG_INVESTMENT_ACCOUNT,
  ),
  'ia.taxFreeValue': announced(
    50000,
    'proposed',
    'First €50,000 of ACCOUNT VALUE is not levied, a 1% levy applies to the value above it. It is not a tax-free amount of gains (press coverage; Finance Bill pending).',
    KPMG_INVESTMENT_ACCOUNT,
  ),
  'ia.levy': announced(
    0.01,
    'proposed',
    'Annual levy on account value above the threshold (press coverage; Finance Bill pending).',
    KPMG_INVESTMENT_ACCOUNT,
  ),
}

/** 2027 values seen second-hand but not confirmed against the DSP table: shown, never used. */
export const CANDIDATES_2027: Record<string, [number, string]> = {
  'sp.qa66': [277.4, 'Citizens Information and Zurich show €277.40 for 2027'],
  'sp.qaUnder66': [206.1, 'Citizens Information and Zurich show €206.10 for 2027'],
  'sp.illness': [264, "Citizens Information shows the same €264 as Jobseeker's Benefit for 2027"],
  'sp.survivor': [269.5, 'Citizens Information shows €269.50 for 2027'],
  'sp.survivor66': [309.3, 'Citizens Information shows €309.30 for 2027'],
  'sp.nonContrib': [298, 'Citizens Information shows €298 for 2027'],
  'sp.qaIllness': [175.2, "Citizens Information shows €175.20 (as Jobseeker's Benefit) for 2027"],
}

export const UNCHANGED_IN_2027 =
  "Not in the Budget 2027 tax measures, so the 2026 figure is carried forward: DIRT, USC rates and the 3% band, PRSI (rate path already legislated), pension relief and lump-sum limits, stamp duty, age credit, single-parent credit, Illness Benefit, survivor's, non-contributory and Qualified Adult rates (the 2027 figures seen in search results are shown in the register but not used until the Department of Social Protection's table confirms them). The Standard Fund Threshold valuation factors are being revised (not modelled)."
