// The standards LifeMap suggests (or a partner's own figures), from the original prototype (SETTINGS); checked in tests/golden/settings.test.ts.
// 'inv' has no value: it is derived from invGross and fundChg (settings.ts). value null = no published figure.
export type StandardValue = number | string | number[] | null
type Figure = number | string | null
type StandardBase = {
  name: string
  group?: string
  cautious?: number
  by?: string
  label?: string
  guide?: string
  note?: string
  source: string
  asOf: string
  verify?: boolean
}
/** A list standard ('pct3') holds three rates; every other unit holds one figure. */
export type Standard = StandardBase &
  (
    | { unit: 'pct3'; value: number[]; partnerValue?: number[] }
    | {
        unit: 'pct' | 'num' | 'eur' | 'yrs' | 'choice'
        value?: Figure
        partnerValue?: Figure
      }
  )

export const CENTRAL_BANK_RATES =
  'https://www.centralbank.ie/statistics/data-and-analysis/credit-and-banking-statistics/retail-interest-rates'
export const DEFAULT_FUND_CHARGES = 0.01 // fund charges used if no charges figure is set (the Pensions Authority assumption)
export const STANDARDS = {
  infl: {
    name: 'Inflation: prices rise (a year)',
    unit: 'pct',
    group: 'Prices & growth',
    value: 0.02,
    by: 'the ECB target for the long term',
    source:
      'https://www.bundesbank.de/en/tasks/topics/european-central-bank-updates-monetary-policy-strategy-970824',
    asOf: '2025 strategy',
    verify: true,
  },
  wage: {
    name: 'Pay rises (a year)',
    unit: 'pct',
    group: 'Prices & growth',
    value: 0.03,
    by: 'Irish pay has grown about 3%–4% a year recently (CSO)',
    source: 'https://www.cso.ie/en/statistics/earnings/',
    asOf: '2026',
    verify: true,
    cautious: 0.025,
    guide: 'Pick lower if your pay is fixed or you expect to work part-time.',
  },
  cash: {
    name: 'Cash savings earn (a year, after DIRT)',
    unit: 'pct',
    group: 'Prices & growth',
    value: 0.01,
    by: 'Irish deposit rates after 33% DIRT',
    // the original links the address without www here
    source:
      'https://centralbank.ie/statistics/data-and-analysis/credit-and-banking-statistics/retail-interest-rates',
    asOf: 'Jun 2026',
    verify: true,
    cautious: 0.007,
  },
  inv: {
    name: 'Investments grow (a year, after charges and tax)',
    unit: 'pct',
    group: 'Prices & growth',
    source:
      'Derived: the growth before fees and tax (above), the charges (Market rates) and the exit tax and 8-year rule (Tax rules)',
    asOf: '2026',
    verify: true,
    guide:
      'A planning assumption, not a prediction. Growth is never guaranteed and funds can fall in value. It moves if you change the growth before fees and tax, or the charges.',
  },
  invGross: {
    name: 'Investments grow before fees and tax (a year; growth and fees tools)',
    unit: 'pct',
    group: 'Prices & growth',
    value: 0.05,
    by: 'LifeMap standard, not a forecast',
    source:
      'LifeMap planning standard, not a prediction. Reference points: Pensions Authority pension-calculator growth assumption; Central Bank of Ireland guidance that returns are not guaranteed',
    asOf: '2026',
    verify: true,
    guide:
      'Used by the lump sum, regular investing, fees and real return tools. Growth is never guaranteed.',
  },
  pen: {
    name: 'Pension grows while you work (a year, after charges)',
    unit: 'pct',
    group: 'Prices & growth',
    value: 0.045,
    by: 'a planning assumption after charges, not a prediction',
    source:
      'LifeMap planning standard, not a prediction. Reference point: Pensions Authority pension-calculator assumptions',
    asOf: '2026',
    verify: true,
    cautious: 0.04,
    guide: 'A planning assumption, not a prediction. Growth is tax-free inside the fund.',
  },
  penRet: {
    name: 'Pension grows once retired (a year, after charges)',
    unit: 'pct',
    group: 'Prices & growth',
    value: 0.0315,
    by: 'a lower-risk fund once retired, after charges',
    source:
      'LifeMap planning standard, not a prediction. Reference point: Pensions Authority pension-calculator assumptions',
    asOf: '2026',
    verify: true,
    cautious: 0.028,
    guide: 'Most people take less risk once retired, so growth is usually lower.',
  },
  rentRise: {
    name: 'Rent vs buy: rent rises (a year)',
    unit: 'pct',
    group: 'Home',
    value: 0.03,
    by: 'a long-run planning figure',
    source:
      'LifeMap long-run planning figure. Reference points: Residential Tenancies Board Rent Index; CSO Consumer Price Index (rent)',
    asOf: '2026',
    verify: true,
    guide:
      "Renting has rent rises. Buying has costs that don't build equity: interest, stamp duty, fees, LPT and repairs.",
  },
  houseGrow: {
    name: 'Rent vs buy: house prices rise (a year)',
    unit: 'pct',
    group: 'Home',
    value: 0.02,
    by: 'a long-run planning figure; prices can fall',
    source:
      'LifeMap long-run planning figure. Reference point: CSO Residential Property Price Index',
    asOf: '2026',
    verify: true,
    guide: 'House prices can fall as well as rise.',
  },
  upkeep: {
    name: 'Rent vs buy: upkeep a year (share of home value)',
    unit: 'pct',
    group: 'Home',
    value: 0.01,
    by: 'repairs, insurance and maintenance',
    source: 'LifeMap planning standard (no official figure exists)',
    asOf: '2026',
  },
  ownShare: {
    name: 'Share of pension contributions you pay yourself',
    unit: 'pct',
    group: 'Retirement',
    value: 0.5,
    by: 'a common 5% + 5% split with your employer; 100% if self-employed',
    source: 'Pensions Authority and My Future Fund (auto-enrolment) contribution split, 2026',
    asOf: '2026',
    guide:
      'Your payslip shows what comes out of your pay. Only your own share gets tax relief. If you type your own amount in Your finances, we use that.',
  },
  retireMult: {
    name: 'Retirement savings target: times the yearly income needed',
    unit: 'num',
    group: 'Retirement',
    value: 25,
    by: 'a common rule of thumb, about 4% a year',
    source:
      'Widely used 4% sustainable-withdrawal rule of thumb (W. Bengen, Journal of Financial Planning, 1994)',
    asOf: '2026',
    guide: 'Retiring early or planning to 95 needs more.',
  },
  retireSpend: {
    name: "Retirement spending if no goal (share of today's spending)",
    unit: 'pct',
    group: 'Retirement',
    value: 0.8,
    by: 'most people spend a bit less once work costs and the mortgage stop',
    source:
      'LifeMap planning standard. Reference points: Pensions Authority and Society of Actuaries in Ireland retirement-income guidance',
    asOf: '2026',
  },
  accessAge: {
    name: 'Pension access age (the earliest age you can draw your pension)',
    unit: 'choice',
    group: 'Retirement',
    value: 60,
    by: 'most pensions can be drawn from 60; some occupational schemes allow 50',
    source:
      'Revenue Commissioners: pension benefits can usually be taken from age 60 (PRSAs and personal pensions); some occupational schemes allow retirement from 50 (see the law register)',
    asOf: '2026',
    verify: true,
    guide:
      'We assume 60. Choose 50 only if your occupational scheme says it allows it. Before this age your plan pays for life from savings and other income.',
  },
  lumpSum: {
    name: 'Tax-free lump sum to take (share of pension; law limit 25%)',
    unit: 'pct',
    group: 'Retirement',
    value: 0.25,
    by: 'most people take the full tax-free amount',
    source:
      'Revenue Commissioners: tax-free retirement lump sum, up to 25% of the fund (law limit)',
    asOf: 'Law limit 25%',
  },
  safetyMonths: {
    name: 'Emergency fund: months of essential spending',
    unit: 'num',
    group: 'Emergency fund & saving',
    value: 6,
    by: '6 months for a single income or self-employed, 3 for two secure incomes',
    source:
      'LifeMap planning standard. Reference points: MABS and CCPC (ccpc.ie) guidance on keeping 3 to 6 months of essential spending as an emergency fund',
    asOf: '2026',
    guide:
      'Easy-access cash for surprises or a gap in pay. Essential spending = living costs + mortgage + loan repayments.',
  },
  safetyMonthsTwo: {
    name: 'Emergency fund: months with two secure incomes',
    unit: 'num',
    group: 'Emergency fund & saving',
    value: 3,
    by: 'two secure incomes',
    source: 'LifeMap planning standard. Reference points: MABS and CCPC guidance',
    asOf: '2026',
  },
  cashYears: {
    name: 'Money for goals sooner than this is kept as cash (years)',
    unit: 'yrs',
    group: 'Emergency fund & saving',
    value: 5,
    by: 'money needed within 5 years is usually kept as cash',
    source:
      'LifeMap planning standard (common planning practice: money needed within about 5 years is not invested)',
    asOf: '2026',
    guide: 'Longer-term money has more time to ride out ups and downs.',
  },
  investShare: {
    name: 'Spare savings: share invested',
    unit: 'pct',
    group: 'Emergency fund & saving',
    value: 0.4,
    by: 'a balanced cash and invested mix',
    source: 'LifeMap planning standard (a balanced cash and invested mix)',
    asOf: '2026',
  },
  cgtGain: {
    name: 'Other assets and alternative investments: share of the value that is a gain',
    unit: 'pct',
    group: 'Emergency fund & saving',
    value: 0.4,
    by: 'a planning figure, because we do not know what you paid',
    source:
      'LifeMap planning standard. Capital gains tax applies to the gain only, not the whole value.',
    asOf: '2026',
    guide:
      'When other assets, crypto, gold or art are sold for a goal, capital gains tax is taken off this share of their value.',
  },
  saveShare: {
    name: 'Share of spare money saved, at most',
    unit: 'pct',
    group: 'Emergency fund & saving',
    value: 0.5,
    by: 'half of your spare money',
    source: 'LifeMap planning standard',
    asOf: '2026',
    guide:
      'We never count more than this share of your spare money as saved, unless you set your own monthly saving.',
  },
  noAnswer: {
    name: 'Monthly saving if not answered',
    unit: 'eur',
    group: 'Emergency fund & saving',
    value: 300,
    by: 'a modest regular amount',
    source: 'LifeMap planning standard',
    asOf: '2026',
    guide: 'Used until you answer "How much could you comfortably invest each month?".',
  },
  lifeShare: {
    name: 'Life cover: share of income the family needs',
    unit: 'pct',
    group: 'Protection',
    value: 0.6,
    by: 'families usually need less than full pay',
    source: 'LifeMap planning standard. Reference point: Irish life-insurer needs calculators',
    asOf: '2026',
  },
  lifeYears: {
    name: 'Life cover: years of support',
    unit: 'yrs',
    group: 'Protection',
    value: 15,
    by: 'often until your youngest child is 23',
    source: 'LifeMap planning standard. Reference point: Irish life-insurer needs calculators',
    asOf: '2026',
  },
  riskMu: {
    name: 'Risk and return: growth a year, Cautious / Balanced / Growth',
    unit: 'pct3',
    group: 'Risk and budget',
    value: [0.02, 0.04, 0.06],
    by: 'illustrations, not forecasts',
    source: 'LifeMap illustrations, not forecasts',
    asOf: '2026',
    guide: "Your adviser uses the fund's own risk rating (SRI 1–7).",
  },
  riskVol: {
    name: 'Risk and return: ups and downs (volatility), Cautious / Balanced / Growth',
    unit: 'pct3',
    group: 'Risk and budget',
    value: [0.05, 0.1, 0.16],
    by: 'illustrations, not forecasts',
    source: 'LifeMap illustrations, not forecasts',
    asOf: '2026',
    guide: 'How much a year can swing.',
  },
  budget: {
    name: 'Budget split: needs / wants / savings and debt',
    unit: 'pct3',
    group: 'Risk and budget',
    value: [0.5, 0.3, 0.2],
    by: 'the 50/30/20 rule',
    source: 'The 50/30/20 budgeting rule (E. Warren and A. Warren Tyagi, All Your Worth, 2005)',
    asOf: '2026',
  },
  bands: {
    name: 'Tax bands in future',
    unit: 'choice',
    group: 'Choices',
    value: 'prices',
    by: 'Budgets have broadly kept pace over time',
    source: 'Department of Finance Budget history (tax bands and credits, 2015 to 2026)',
    asOf: '2026',
    guide:
      'Irish tax bands are set each Budget and don\'t rise automatically. "Stay as today" is the cautious view (more tax later).',
  },
  spGrow: {
    name: 'State Pension in future',
    unit: 'choice',
    group: 'Choices',
    value: 'prices',
    by: 'it has broadly kept pace with prices over time',
    source: 'Department of Social Protection weekly State Pension rate history',
    asOf: '2026',
    guide: 'The State Pension is set each Budget.',
  },
  drawRule: {
    name: 'How you draw your pension',
    unit: 'choice',
    group: 'Choices',
    value: 'spread',
    by: 'spread over your plan, at least the legal minimum',
    source:
      'Revenue Commissioners: ARF and vested PRSA minimum annual distribution (4% from 61, 5% from 71; 6% over €2m)',
    asOf: '2026',
  },
  ddTiming: {
    name: 'Drawdown tools: withdrawals taken at the',
    unit: 'choice',
    group: 'Choices',
    value: 'start',
    by: 'the prudent choice: the money has less time to grow before you take it',
    source: 'LifeMap tool setting',
    asOf: '2026',
  },
  waitYears: {
    name: 'Lump sum tool: years you might wait before investing',
    unit: 'yrs',
    group: 'Choices',
    value: 5,
    by: 'an illustration of the cost of waiting',
    source: 'LifeMap tool setting (an illustration of the cost of waiting)',
    asOf: '2026',
  },
  style: {
    name: 'Risk and return tool: investment style (1 Cautious, 2 Balanced, 3 Growth)',
    unit: 'num',
    group: 'Choices',
    value: 2,
    by: 'Balanced; an adviser checks your attitude to risk',
    source: 'LifeMap tool setting (Balanced; an adviser checks attitude to risk)',
    asOf: '2026',
  },
  mortRate: {
    name: 'Suggested mortgage rate',
    unit: 'pct',
    group: 'Market rates',
    value: 0.0348,
    by: 'Central Bank of Ireland: average rate on new mortgages, Jul 2026',
    label: 'Central Bank of Ireland: average rate on new mortgages, Jul 2026',
    source: CENTRAL_BANK_RATES,
    asOf: 'Jul 2026',
    verify: true,
    guide: 'Your mortgage statement shows your rate. Typing it is fine: no upload needed.',
  },
  loanRate: {
    name: 'Suggested personal and car loan rate (APR)',
    unit: 'pct',
    group: 'Market rates',
    value: 0.0672,
    by: 'Central Bank of Ireland: average rate on new consumer loans, Jul 2026',
    label: 'Central Bank of Ireland: average rate on new consumer loans, Jul 2026',
    source: CENTRAL_BANK_RATES,
    asOf: 'Jul 2026',
    verify: true,
    guide: 'Your loan agreement shows your APR.',
  },
  cardRate: {
    name: 'Suggested credit card rate (APR)',
    unit: 'pct',
    group: 'Market rates',
    value: null,
    by: 'No published average',
    label: 'No published average',
    source: CENTRAL_BANK_RATES,
    asOf: '—',
    verify: true,
    guide: 'Your card statement shows your APR.',
  },
  depRate: {
    name: 'Suggested deposit rate (fixed term, before 33% DIRT)',
    unit: 'pct',
    group: 'Market rates',
    value: 0.0192,
    by: 'Central Bank of Ireland: average rate on new fixed-term household deposits, Jul 2026',
    label: 'Central Bank of Ireland: average rate on new fixed-term household deposits, Jul 2026',
    source: CENTRAL_BANK_RATES,
    asOf: 'Jul 2026',
    verify: true,
    guide:
      'If you rent, your deposit stays in savings. Leave it blank and we use the suggested rate (Assumed: add yours).',
  },
  buyFees: {
    name: 'Suggested buying fees (legal and survey)',
    unit: 'eur',
    group: 'Market rates',
    value: null,
    by: 'No published figure',
    label: 'No published figure',
    source: 'No published figure',
    asOf: '—',
  },
  fundChg: {
    name: 'Suggested fund and pension charges (a year)',
    unit: 'pct',
    group: 'Market rates',
    value: 0.01,
    by: 'Pensions Authority pension calculator assumption',
    label: 'Pensions Authority pension calculator assumption',
    note: 'Usually between 0.5% and 2% a year (CCPC)',
    source:
      'https://pensionsauthority.ie/scheme-members-and-prsa-contributors/pension-calculator/assumptions/ · https://www.ccpc.ie/consumers/money/pensions/fees-and-charges/',
    asOf: '2026',
    verify: true,
    guide: 'When your statement shows your own charges, we use them instead of this.',
  },
} satisfies Record<string, Standard>
export type StandardKey = keyof typeof STANDARDS

/** Standard keys by group, in the order they are listed. */
export const STANDARD_GROUPS = Object.groupBy(
  Object.keys(STANDARDS) as StandardKey[],
  (key) => STANDARDS[key].group ?? '',
)
export const GUIDANCE_FIGURES: Record<string, Standard> = {
  lifeMen65: {
    name: 'Life expectancy at 65, men (years): guidance only',
    unit: 'num',
    value: 83,
    by: 'CSO, Irish Life Tables No. 17, 2015–2017',
    source: 'https://www.cso.ie/en/releasesandpublications/er/ilt/irishlifetablesno172015-2017/',
    asOf: '2015–2017 (latest edition; 65 + 18.3 years)',
    verify: true,
  },
  lifeWomen65: {
    name: 'Life expectancy at 65, women (years): guidance only',
    unit: 'num',
    value: 86,
    by: 'CSO, Irish Life Tables No. 17, 2015–2017',
    source: 'https://www.cso.ie/en/releasesandpublications/er/ilt/irishlifetablesno172015-2017/',
    asOf: '2015–2017 (latest edition; 65 + 21.0 years)',
    verify: true,
  },
}
