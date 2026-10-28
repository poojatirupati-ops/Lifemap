// Irish rules and rates 2026: data only (ported from the prototype's RULES_IE_2026 and RI).
// Each leaf: v (value), src (source URL), eff (effective date), verify (open the source page before release), by (source as the customer sees it).
// Judgement values are not here: they live in assumptions.ts.
export type Rule<T> = { readonly v: T; readonly src: string; readonly eff: string; readonly verify: boolean; readonly by?: string }
export type Bands = readonly (readonly [number, number])[]
export type PrsiStep = { readonly y: number; readonly m: number; readonly r: number }

const rv = <T>(v: T, src: string, eff: string, verify?: boolean, by?: string): Rule<T> => ({ v, src, eff, verify: verify !== false, by })

export const RULES_VERSION = 'Irish rules 2026 · checked 2 Oct 2026, with Budget 2027 changes already in force (CGT, Help to Buy)'

export const RULES_IE_2026 = {
  it:{   // income tax
    band:rv(44000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '1 Jan 2026'),
    bandSPCCC:rv(48000, 'https://www.noonecasey.ie/irish-budget-2026/', '1 Jan 2026'),
    bandMarried:rv(53000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '1 Jan 2026'),
    bandUplift:rv(35000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '1 Jan 2026'),
    r1:rv(0.20, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    r2:rv(0.40, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    personal:rv(2000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    personalMarried:rv(4000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    paye:rv(2000, 'https://revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/employee-tax-credit/index.aspx', '2026'),
    eic:rv(2000, 'https://revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/employee-tax-credit/index.aspx', '2026'),
    payeCapPct:rv(0.20, 'https://revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/employee-tax-credit/index.aspx', '2026'),
    rent:rv(1000, 'https://www.noonecasey.ie/irish-budget-2026/', '2025–2028'),
    rentJoint:rv(2000, 'https://www.noonecasey.ie/irish-budget-2026/', '2025–2028'),
    rentLastYear:rv(2028, 'https://www.noonecasey.ie/irish-budget-2026/', 'extended to end-2028'),
    spccc:rv(1900, 'https://www.irishtaxhub.ie/blog/tax-credits-in-ireland-full-list', '1 Jan 2026'),
    homeCarer:rv(1950, 'https://www.noonecasey.ie/irish-budget-2026/', '2026 (verify rate)'),
    homeCarerLimit:rv(7200, 'https://www.noonecasey.ie/irish-budget-2026/', '2026 (verify limit and taper)'),
    ageCreditAge:rv(65, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    ageCredit:rv(245, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    ageExempt:rv(18000, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    ageExemptMarried:rv(36000, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    ageMarginal:rv(0.40, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', 'Law')
  },
  usc:{
    bands:rv<Bands>([[12012, 0.005], [28700, 0.02], [70044, 0.03], [Infinity, 0.08]], 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '1 Jan 2026'),
    exempt:rv(13000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    reducedAge:rv(70, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    reducedMax:rv(60000, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    reducedBands:rv<Bands>([[12012, 0.005], [Infinity, 0.02]], 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    seSurcharge:rv(0.03, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    seSurchargeOver:rv(100000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026')
  },
  prsi:{
    // Class A/S rate path (Budget 2025 roadmap): {y, m (month it starts), r}
    path:rv<readonly PrsiStep[]>([{y:2025, m:10, r:0.042}, {y:2026, m:10, r:0.0435}, {y:2027, m:10, r:0.045}, {y:2028, m:10, r:0.047}], 'https://www.gov.ie/en/publication/ffa563-prsi-class-a-rates', '1 Oct 2026 (4.35%)'),
    wkFree:rv(352, 'https://payslipiq.co.uk/ie/methodology/prsi', '2026'),
    creditMax:rv(12, 'https://payslipiq.co.uk/ie/methodology/prsi', '2026'),
    creditTo:rv(424, 'https://payslipiq.co.uk/ie/methodology/prsi', '2026'),
    creditTaper:rv(6, 'https://payslipiq.co.uk/ie/methodology/prsi', '2026'),
    endAge:rv(66, 'https://www.oireachtas.ie/en/debates/question/2018-11-21/241/', 'Law'),
    sMinIncome:rv(5000, 'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-s-rates/', '2026'),
    sMin:rv(650, 'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-s-rates/', '2026'),
    unearnedMin:rv(5000, 'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-s-rates/', '2026')
  },
  pen:{
    relief:rv<Bands>([[30, 0.15], [40, 0.20], [50, 0.25], [55, 0.30], [60, 0.35], [Infinity, 0.40]], 'https://www.irishtaxhub.ie/blog/pension-contributions-income-tax-maximize-your-relief', 'Unchanged'),
    earnCap:rv(115000, 'https://www.irishtaxhub.ie/blog/pension-contributions-income-tax-maximize-your-relief', 'Unchanged'),
    lsMaxPct:rv(0.25, 'https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html', 'Finance Act 2024'),
    lsTaxFree:rv(200000, 'https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html', 'Finance Act 2024 (lifetime, not indexed)'),
    lsCap:rv(500000, 'https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html', 'Finance Act 2024 (not indexed)'),
    lsBandRate:rv(0.20, 'https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html', 'Finance Act 2024'),
    sft:rv({2026:2.2e6, 2027:2.4e6, 2028:2.6e6, 2029:2.8e6}, 'https://wtwco.com/en-ie/insights/2024/10/significant-revisions-announced-to-the-standard-fund-threshold', '1 Jan 2026'),
    sftRate:rv(0.40, 'https://wtwco.com/en-ie/insights/2024/10/significant-revisions-announced-to-the-standard-fund-threshold', 'Law'),
    arfMin61:rv(0.04, 'https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf', 'Law'),
    arfMin71:rv(0.05, 'https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf', 'Law'),
    arfMinBig:rv(0.06, 'https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf', 'Law'),
    arfBig:rv(2e6, 'https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf', 'Law'),
    earliestAge:rv(60, 'https://www.revenue.ie/en/tax-professionals/tdm/pensions/index.aspx', 'Law (PRSA / personal pensions)')
  },
  ae:{   // auto-enrolment (My Future Fund), phase 1
    start:rv(2026, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    ageMin:rv(23, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    ageMax:rv(60, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    earnMin:rv(20000, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    earnCap:rv(80000, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    ee:rv(0.015, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '2026–2028'),
    er:rv(0.015, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '2026–2028'),
    state:rv(0.005, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '2026–2028')
  },
  sp:{   // State Pension (Contributory) and other DSP payments, weekly
    week:rv(299.30, 'https://www.gov.ie/en/publication/927721-state-pension-contributory-rates/', '1 Jan 2026'),
    age:rv(66, 'https://www.gov.ie/en/publication/d8fd8-flexible-pension-options', 'Law'),
    over80:rv(10, 'https://www.zurich.ie/blog/pension-changes-2026', '2026'),
    qa66:rv(268.40, 'https://www.zurich.ie/blog/pension-changes-2026', '1 Jan 2026'),
    qaUnder66:rv(199.40, 'https://www.inou.ie/assets/files/pdf/2026_-_inou_budget_factsheet.pdf', '1 Jan 2026'),
    fullYears:rv(40, 'https://www.gov.ie/en/publication/b6193-how-to-calculate-your-state-pension-contributory-rate', 'Law'),
    minYears:rv(10, 'https://www.gov.ie/en/publication/b6193-how-to-calculate-your-state-pension-contributory-rate', 'Law'),
    illness:rv(254, 'https://www.inou.ie/assets/files/pdf/2026_-_inou_budget_factsheet.pdf', '1 Jan 2026'),
    survivor:rv(259.50, 'https://www.raisin.com/en-ie/pensions/widow-pensions', '1 Jan 2026'),
    survivor66:rv(299.30, 'https://www.raisin.com/en-ie/pensions/widow-pensions', '1 Jan 2026'),
    weeks:rv(52, 'Convention', '—', false)
  },
  sav:{   // savings and investment tax (shown as notes)
    dirt:rv(0.33, 'https://cantorfitzgerald.ie/budget-2026-key-updates-for-investors-and-savers', '2026'),
    exit:rv(0.38, 'https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-0162026.aspx', '1 Jan 2026'),
    deemed:rv(8, 'https://etf.ie/blog/budget-2026-etf/', '2026'),
    cgt:rv(0.31, 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/', 'disposals from 7 Oct 2026 (Budget 2027)', false),
    cgtExempt:rv(1270, 'https://www.revenue.ie/en/gains-gifts-and-inheritance/', 'Law (annual exemption per person)'),
    cat:rv(420000, 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/', 'gifts and inheritances from 7 Oct 2026 (Group A up 5%, from €400,000)')
  },
  home:{
    ltiFTB:rv(4, 'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework', '1 Jan 2023'),
    ltiSSB:rv(3.5, 'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework', '1 Jan 2023'),
    ltv:rv(0.90, 'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework', '1 Jan 2023'),
    stamp:rv<Bands>([[1e6, 0.01], [1.5e6, 0.02], [Infinity, 0.06]], 'https://www.raisin.com/en-ie/taxes/stamp-duty-ireland/', 'Budget 2025'),
    htbMax:rv(35000, 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/', 'immediate effect, Budget 2027 (scheme to 31 Dec 2029)', false)
  },
  infl:{
    ie:rv(0.039, 'https://www.cso.ie/en/csolatestnews/pressreleases/2026pressreleases/pressstatementflashestimatefortheharmonisedindexofconsumerpricesseptember2026/', 'CSO HICP flash, Sep 2026 (published 1 Oct 2026)'),
    ieSrc:rv('CSO HICP flash, Sep 2026', 'https://www.cso.ie', '1 Oct 2026')
  },
  // Regulatory facts quoted in copy (law: fixed for everyone). The prototype's SETTINGS (standards and guidance figures) are judgement values and will live with the planning context.
  guide:{
    cardCap:rv(0.23, 'https://www.centralbank.ie/news/article/central-bank-review-finds-over-400-000-credit-cards-are-on-historic-high-interest-rates', '2022', true, 'Central Bank of Ireland'),
    schemeEarliest:rv(50, 'https://www.revenue.ie/en/tax-professionals/tdm/pensions/index.aspx', 'Law', true, 'some occupational schemes')
  }
} as const

// Budget 2027 (announced 6 Oct 2026): each entry replaces the RI value at that path from 1 Jan 2027 (no switching logic here; the planning context applies it).
const B27 = 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/'
const dsp = 'Jan 2027 (+€10 assumed from the general €10 rise; the exact rate is not in the guide)'
export const RULES_2027 = {
  'it.band':rv(46500, B27, '1 Jan 2027', false), 'it.bandSPCCC':rv(50500, B27, '1 Jan 2027', false), 'it.bandMarried':rv(55500, B27, '1 Jan 2027', false), 'it.bandUplift':rv(37500, B27, '1 Jan 2027 (two incomes up to 93,000)', false),
  'it.personal':rv(2125, B27, '1 Jan 2027', false), 'it.personalMarried':rv(4250, B27, '1 Jan 2027', false), 'it.paye':rv(2125, B27, '1 Jan 2027', false), 'it.eic':rv(2125, B27, '1 Jan 2027', false),
  'it.homeCarer':rv(2050, B27, '1 Jan 2027', false), 'it.rent':rv(1150, B27, '2027 and 2028', false), 'it.rentJoint':rv(2300, B27, '2027 and 2028', false),
  'usc.bands':rv<Bands>([[12012, 0.005], [30300, 0.02], [70044, 0.03], [Infinity, 0.08]], B27, '1 Jan 2027 (2% band now to 30,300)', false),
  'sp.week':rv(309.30, B27, 'Jan 2027 (+€10 on weekly social welfare payments)', false), 'sp.illness':rv(264, B27, dsp), 'sp.survivor':rv(269.50, B27, dsp), 'sp.survivor66':rv(309.30, B27, dsp),
  'sav.exit':rv(0.35, B27, '1 Jan 2027 (Investment Undertaking Tax, life assurance exit tax, equivalent offshore funds and certain foreign policies; 8-year deemed disposal stays)', false),
} as const

export const RULES_2027_NOT_CHANGED = 'Not in the Budget 2027 tax measures, so 2026 figures stay: DIRT, USC rates and the 3% band, PRSI (rate path already legislated), pension relief and lump-sum limits, stamp duty, age credit, single-parent credit. The Standard Fund Threshold valuation factors are being revised (not modelled). The exact Qualified Adult rate is not in the published guide and stays at 2026.'

// RI: the plain values every function reads (RI.it.band = 44000 ...), same shape with each rule's { v } unwrapped.
type Unwrap<T> = T extends Rule<infer V> ? V : { -readonly [K in keyof T]: Unwrap<T[K]> }
const unwrap = <T>(o: T): Unwrap<T> =>
  Object.fromEntries(Object.entries(o as object).map(([k, x]) => [k, 'v' in x && 'src' in x ? x.v : unwrap(x)])) as Unwrap<T>
export const RI = unwrap(RULES_IE_2026)
