// Irish rules register, from the original prototype (RULES_2026); checked deep-equal in tests/golden/rates.test.ts.
// verify: open the primary source again before release. by: the source as the customer sees it.
export type Rule<T = any> = {
  value: T
  source: string
  effective: string
  verify: boolean
  by?: string
}

export const rule = <T>(
  value: T,
  source: string,
  effective: string,
  verify = true,
  by?: string,
): Rule<T> => ({ value, source, effective, verify, by })

export const BUDGET_2027_SOURCE =
  'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/'
// sources quoted by more than one rule
const INCOME_TAX_RATES = 'https://www.raisin.com/en-ie/taxes/income-tax-rates/'
const BUDGET_2026_SUMMARY = 'https://www.noonecasey.ie/irish-budget-2026/'
const EMPLOYEE_TAX_CREDIT =
  'https://revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/employee-tax-credit/index.aspx'
const RETIREES_BUDGET_2026 =
  'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you'
const PRSI_METHOD = 'https://payslipiq.co.uk/ie/methodology/prsi'
const PRSI_CLASS_S =
  'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-s-rates/'
const PENSION_RELIEF =
  'https://www.irishtaxhub.ie/blog/pension-contributions-income-tax-maximize-your-relief'
const FINANCE_ACT_2024_PENSIONS =
  'https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html'
const SFT_REVISIONS =
  'https://wtwco.com/en-ie/insights/2024/10/significant-revisions-announced-to-the-standard-fund-threshold'
const ARF_BROCHURE =
  'https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf'
const REVENUE_PENSIONS_MANUAL =
  'https://www.revenue.ie/en/tax-professionals/tdm/pensions/index.aspx'
const AUTO_ENROLMENT =
  'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers'
const PENSION_CHANGES_2026 = 'https://www.zurich.ie/blog/pension-changes-2026'
const WELFARE_BUDGET_2026 = 'https://www.inou.ie/assets/files/pdf/2026_-_inou_budget_factsheet.pdf'
const STATE_PENSION_RATE =
  'https://www.gov.ie/en/publication/b6193-how-to-calculate-your-state-pension-contributory-rate'
const SURVIVOR_PENSIONS = 'https://www.raisin.com/en-ie/pensions/widow-pensions'
const CITIZENS_INFO_PRSI =
  'https://www.citizensinformation.ie/en/social-welfare/irish-social-welfare-system/social-insurance-prsi/social-insurance-classes/'
const SOCIAL_PROTECTION = 'https://www.gov.ie/en/department-of-social-protection/'
export const CITIZENS_INFO_BUDGET_2027 =
  'https://www.citizensinformation.ie/en/money-and-tax/budgets/budget-2027/'
export const KPMG_INVESTMENT_ACCOUNT =
  'https://kpmg.com/ie/en/insights/tax/budget-2027/investment-account.html'
const REVENUE_CGT_EBRIEF = 'https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-1422026.aspx'
const MORTGAGE_MEASURES =
  'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework'

export const RULES_2026 = {
  it: {
    band: rule(44000, INCOME_TAX_RATES, '1 Jan 2026'),
    bandSPCCC: rule(48000, BUDGET_2026_SUMMARY, '1 Jan 2026'),
    bandMarried: rule(53000, INCOME_TAX_RATES, '1 Jan 2026'),
    bandUplift: rule(35000, INCOME_TAX_RATES, '1 Jan 2026'),
    r1: rule(0.2, INCOME_TAX_RATES, '2026'),
    r2: rule(0.4, INCOME_TAX_RATES, '2026'),
    personal: rule(2000, INCOME_TAX_RATES, '2026'),
    personalMarried: rule(4000, INCOME_TAX_RATES, '2026'),
    paye: rule(2000, EMPLOYEE_TAX_CREDIT, '2026'),
    eic: rule(2000, EMPLOYEE_TAX_CREDIT, '2026'),
    payeCapPct: rule(0.2, EMPLOYEE_TAX_CREDIT, '2026'),
    rent: rule(1000, BUDGET_2026_SUMMARY, '2025–2028'),
    rentJoint: rule(2000, BUDGET_2026_SUMMARY, '2025–2028'),
    rentLastYear: rule(2028, BUDGET_2026_SUMMARY, 'extended to end-2028'),
    spccc: rule(
      1900,
      'https://www.irishtaxhub.ie/blog/tax-credits-in-ireland-full-list',
      '1 Jan 2026',
    ),
    homeCarer: rule(1950, BUDGET_2026_SUMMARY, '2026 (verify rate)'),
    homeCarerLimit: rule(7200, BUDGET_2026_SUMMARY, '2026 (verify limit and taper)'),
    ageCreditAge: rule(65, RETIREES_BUDGET_2026, '2026'),
    ageCredit: rule(245, RETIREES_BUDGET_2026, '2026'),
    ageExempt: rule(18000, RETIREES_BUDGET_2026, '2026'),
    ageExemptMarried: rule(36000, RETIREES_BUDGET_2026, '2026'),
    ageMarginal: rule(0.4, RETIREES_BUDGET_2026, 'Law'),
  },
  usc: {
    bands: rule(
      [
        [12012, 0.005],
        [28700, 0.02],
        [70044, 0.03],
        [Infinity, 0.08],
      ],
      INCOME_TAX_RATES,
      '1 Jan 2026',
    ),
    exempt: rule(13000, INCOME_TAX_RATES, '2026'),
    reducedAge: rule(70, RETIREES_BUDGET_2026, '2026'),
    reducedMax: rule(60000, RETIREES_BUDGET_2026, '2026'),
    reducedBands: rule(
      [
        [12012, 0.005],
        [Infinity, 0.02],
      ],
      RETIREES_BUDGET_2026,
      '2026',
    ),
    seSurcharge: rule(0.03, INCOME_TAX_RATES, '2026'),
    seSurchargeOver: rule(100000, INCOME_TAX_RATES, '2026'),
  },
  prsi: {
    path: rule(
      [
        { y: 2025, m: 10, r: 0.042 },
        { y: 2026, m: 10, r: 0.0435 },
        { y: 2027, m: 10, r: 0.045 },
        { y: 2028, m: 10, r: 0.047 },
      ],
      'https://www.gov.ie/en/publication/ffa563-prsi-class-a-rates',
      '1 Oct 2026 (4.35%)',
    ),
    wkFree: rule(352, PRSI_METHOD, '2026'),
    creditMax: rule(12, PRSI_METHOD, '2026'),
    creditTo: rule(424, PRSI_METHOD, '2026'),
    creditTaper: rule(6, PRSI_METHOD, '2026'),
    endAge: rule(66, 'https://www.oireachtas.ie/en/debates/question/2018-11-21/241/', 'Law'),
    sMinIncome: rule(5000, PRSI_CLASS_S, '2026'),
    sMin: rule(650, PRSI_CLASS_S, '2026'),
    arfApplies: rule(
      true,
      CITIZENS_INFO_PRSI,
      'PRSI on ARF / PRSA withdrawals. Deducted (Class S) before 66, and from 66 to 70 unless you receive the contributory State Pension (rule from 1 Jan 2024). Verified by the proposition owner.',
    ),
    arfToAge: rule(
      70,
      CITIZENS_INFO_PRSI,
      'age to which PRSI on ARF withdrawals continues if you do not receive the contributory State Pension (verified)',
    ),
    unearnedMin: rule(5000, PRSI_CLASS_S, '2026'),
  },
  pen: {
    relief: rule(
      [
        [30, 0.15],
        [40, 0.2],
        [50, 0.25],
        [55, 0.3],
        [60, 0.35],
        [Infinity, 0.4],
      ],
      PENSION_RELIEF,
      'Unchanged',
    ),
    earnCap: rule(115000, PENSION_RELIEF, 'Unchanged'),
    lsMaxPct: rule(0.25, FINANCE_ACT_2024_PENSIONS, 'Finance Act 2024'),
    lsTaxFree: rule(200000, FINANCE_ACT_2024_PENSIONS, 'Finance Act 2024 (lifetime, not indexed)'),
    lsCap: rule(500000, FINANCE_ACT_2024_PENSIONS, 'Finance Act 2024 (not indexed)'),
    lsBandRate: rule(0.2, FINANCE_ACT_2024_PENSIONS, 'Finance Act 2024'),
    sft: rule(
      { '2026': 2200000, '2027': 2400000, '2028': 2600000, '2029': 2800000 },
      SFT_REVISIONS,
      '1 Jan 2026',
    ),
    sftRate: rule(0.4, SFT_REVISIONS, 'Law'),
    arfMin61: rule(0.04, ARF_BROCHURE, 'Law'),
    arfMin71: rule(0.05, ARF_BROCHURE, 'Law'),
    arfMinBig: rule(0.06, ARF_BROCHURE, 'Law'),
    arfBig: rule(2000000, ARF_BROCHURE, 'Law'),
    earliestAge: rule(60, REVENUE_PENSIONS_MANUAL, 'Law (PRSA / personal pensions)'),
  },
  ae: {
    start: rule(2026, AUTO_ENROLMENT, '1 Jan 2026'),
    ageMin: rule(23, AUTO_ENROLMENT, '1 Jan 2026'),
    ageMax: rule(60, AUTO_ENROLMENT, '1 Jan 2026'),
    earnMin: rule(20000, AUTO_ENROLMENT, '1 Jan 2026'),
    earnCap: rule(80000, AUTO_ENROLMENT, '1 Jan 2026'),
    ee: rule(0.015, AUTO_ENROLMENT, '2026–2028'),
    er: rule(0.015, AUTO_ENROLMENT, '2026–2028'),
    state: rule(0.005, AUTO_ENROLMENT, '2026–2028'),
  },
  sp: {
    week: rule(
      299.3,
      'https://www.gov.ie/en/publication/927721-state-pension-contributory-rates/',
      '1 Jan 2026',
    ),
    age: rule(66, 'https://www.gov.ie/en/publication/d8fd8-flexible-pension-options', 'Law'),
    over80: rule(10, PENSION_CHANGES_2026, '2026'),
    qa66: rule(268.4, PENSION_CHANGES_2026, '1 Jan 2026'),
    qaUnder66: rule(199.4, WELFARE_BUDGET_2026, '1 Jan 2026'),
    fullYears: rule(40, STATE_PENSION_RATE, 'Law'),
    minYears: rule(10, STATE_PENSION_RATE, 'Law'),
    illness: rule(254, WELFARE_BUDGET_2026, '1 Jan 2026'),
    survivor: rule(259.5, SURVIVOR_PENSIONS, '1 Jan 2026'),
    survivor66: rule(299.3, SURVIVOR_PENSIONS, '1 Jan 2026'),
    weeks: rule(52, 'Convention', '—', false),
    iqaLimit: rule(
      310,
      CITIZENS_INFO_BUDGET_2027,
      "Qualified Adult: the partner's own income must not be above this a week for the full increase (Citizens Information, as quoted in search results; the DSP page was not opened)",
    ),
    nonContrib: rule(288, SOCIAL_PROTECTION, '1 Jan 2026 (reference only: not used by the plan)'),
    qaIllness: rule(168.6, SOCIAL_PROTECTION, '1 Jan 2026 (reference only: not used by the plan)'),
  },
  // the proposed Investment Account (Budget 2027); nothing here is used by the plan
  ia: {
    start: rule(null, KPMG_INVESTMENT_ACCOUNT, 'not in 2026'),
    limit: rule(null, KPMG_INVESTMENT_ACCOUNT, 'not in 2026'),
    taxFreeValue: rule(null, KPMG_INVESTMENT_ACCOUNT, 'not in 2026'),
    levy: rule(null, KPMG_INVESTMENT_ACCOUNT, 'not in 2026'),
  },
  sav: {
    dirt: rule(
      0.33,
      'https://cantorfitzgerald.ie/budget-2026-key-updates-for-investors-and-savers',
      '2026',
    ),
    exit: rule(
      0.38,
      'https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-0162026.aspx',
      '1 Jan 2026',
    ),
    deemed: rule(8, 'https://etf.ie/blog/budget-2026-etf/', '2026'),
    cgt: rule(
      0.31,
      REVENUE_CGT_EBRIEF,
      'standard rate on disposals from 7 Oct 2026 (Revenue eBrief 142/26; verified)',
    ),
    cgtBefore: rule(0.33, REVENUE_CGT_EBRIEF, 'standard rate on disposals before 7 Oct 2026'),
    cgtFrom: rule('2026-10-07', REVENUE_CGT_EBRIEF, 'date the 31% rate starts'),
    cgtDev: rule(0.33, REVENUE_CGT_EBRIEF, 'development land stays at 33% (not modelled)'),
    cgtExempt: rule(
      1270,
      'https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-19/19-07-01.pdf',
      "annual exemption per person each tax year: stated in Revenue TDM 19-07-01 and Revenue's CGT pages as quoted in search results (losses come off first, not transferable between spouses, unused amount lost). Verified by the proposition owner",
    ),
    cat: rule(
      420000,
      BUDGET_2027_SOURCE,
      'gifts and inheritances from 7 Oct 2026 (Group A up 5%, from €400,000)',
    ),
  },
  home: {
    ltiFTB: rule(4, MORTGAGE_MEASURES, '1 Jan 2023'),
    ltiSSB: rule(3.5, MORTGAGE_MEASURES, '1 Jan 2023'),
    ltv: rule(0.9, MORTGAGE_MEASURES, '1 Jan 2023'),
    stamp: rule(
      [
        [1000000, 0.01],
        [1500000, 0.02],
        [Infinity, 0.06],
      ],
      'https://www.raisin.com/en-ie/taxes/stamp-duty-ireland/',
      'Budget 2025',
    ),
    htbMax: rule(
      35000,
      BUDGET_2027_SOURCE,
      'immediate effect, Budget 2027 (scheme to 31 Dec 2029)',
      false,
    ),
  },
  infl: {
    ie: rule(
      0.039,
      'https://www.cso.ie/en/csolatestnews/pressreleases/2026pressreleases/pressstatementflashestimatefortheharmonisedindexofconsumerpricesseptember2026/',
      'CSO HICP flash, Sep 2026 (published 1 Oct 2026)',
    ),
    ieSrc: rule('CSO HICP flash, Sep 2026', 'https://www.cso.ie', '1 Oct 2026'),
  },
  guide: {
    cardCap: rule(
      0.23,
      'https://www.centralbank.ie/news/article/central-bank-review-finds-over-400-000-credit-cards-are-on-historic-high-interest-rates',
      '2022',
      true,
      'Central Bank of Ireland',
    ),
    schemeEarliest: rule(50, REVENUE_PENSIONS_MANUAL, 'Law', true, 'some occupational schemes'),
  },
}
