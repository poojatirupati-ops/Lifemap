// Register tables (spec 14, 18, 19.6, 27.5): STANDARDS apply from the start, MARKET rates are suggestion chips only. Rules live in settings.ts.
import { RI } from './rates.ts'

export type Unit = 'pct' | 'eur' | 'num' | 'yrs' | 'choice' | 'pct3'
export type Entry = {
  readonly n: string; readonly u: Unit; readonly grp: string
  readonly v: number | string | readonly number[] | null
  readonly by: string; readonly src: string; readonly asat: string; readonly verify: boolean
  readonly guide?: string; readonly vc?: number
}


const LS = 'LifeMap planning standard, not a prediction. Reference point: Pensions Authority pension-calculator assumptions'
const CBI = 'https://www.centralbank.ie/statistics/data-and-analysis/credit-and-banking-statistics/retail-interest-rates'
const lm = (src = 'LifeMap planning standard') => ({ src, asat: '2026', verify: false })

const pc = (x: number) => `${Math.round(x * 1000) / 10}%`
export const invBy = (gross: number, charges: number) => `a planning assumption, not a prediction: ${pc(gross)} before fees and tax, less about ${pc(charges)} charges, less exit tax taken every ${RI.sav.deemed} years`
// Growth before fees and tax, less charges, less exit tax every deemed-disposal period, per year to 0.1%. Derived so it cannot drift from its wording.
export const invNet = (gross: number, charges: number, extraCut = 0): number => {
  const y = RI.sav.deemed, f = Math.pow(1 + gross - extraCut - charges, y)
  return Math.round((Math.pow(f - RI.sav.exit * (f - 1), 1 / y) - 1) * 1000) / 1000
}

export const STANDARDS = {
  wage: { n: 'Pay rises (a year)', u: 'pct', grp: 'Prices & growth', v: 0.03, by: 'Irish pay has grown about 3%-4% a year recently (CSO)', src: 'https://www.cso.ie/en/statistics/earnings/', asat: '2026', verify: true, vc: 0.025, guide: 'Pick lower if your pay is fixed or you expect to work part-time.' },
  cash: { n: 'Cash savings earn (a year, after DIRT)', u: 'pct', grp: 'Prices & growth', v: 0.01, by: 'Irish deposit rates after 33% DIRT', src: CBI, asat: 'Jun 2026', verify: true, vc: 0.007 },
  invGross: { n: 'Investments grow before fees and tax (a year)', u: 'pct', grp: 'Prices & growth', v: 0.05, by: 'LifeMap standard, not a forecast', src: 'LifeMap planning standard, not a prediction. Reference points: Pensions Authority pension-calculator growth assumption; Central Bank of Ireland guidance that returns are not guaranteed', asat: '2026', verify: true, guide: 'Growth is never guaranteed.' },
  inv: { n: 'Investments grow (a year, after charges and tax)', u: 'pct', grp: 'Prices & growth', v: invNet(0.05, 0.01), by: invBy(0.05, 0.01), src: 'Derived from growth before fees and tax, the charges and the exit tax 8-year rule (see invNet)', asat: '2026', verify: true, vc: invNet(0.05, 0.01, 0.01), guide: 'A planning assumption, not a prediction. Funds can fall in value.' },
  pen: { n: 'Pension grows while you work (a year, after charges)', u: 'pct', grp: 'Prices & growth', v: 0.045, by: 'a planning assumption after charges, not a prediction', src: LS, asat: '2026', verify: true, vc: 0.04, guide: 'Growth is tax-free inside the fund.' },
  penRet: { n: 'Pension grows once retired (a year, after charges)', u: 'pct', grp: 'Prices & growth', v: 0.0315, by: 'a lower-risk fund once retired, after charges', src: LS, asat: '2026', verify: true, vc: 0.028, guide: 'Most people take less risk once retired, so growth is usually lower.' },
  rentRise: { n: 'Rent vs buy: rent rises (a year)', u: 'pct', grp: 'Home', v: 0.03, by: 'a long-run planning figure', ...lm('LifeMap long-run planning figure. Reference points: RTB Rent Index; CSO Consumer Price Index (rent)'), verify: true },
  houseGrow: { n: 'Rent vs buy: house prices rise (a year)', u: 'pct', grp: 'Home', v: 0.02, by: 'a long-run planning figure; prices can fall', ...lm('LifeMap long-run planning figure. Reference point: CSO Residential Property Price Index'), verify: true, guide: 'House prices can fall as well as rise.' },
  upkeep: { n: 'Rent vs buy: upkeep a year (share of home value)', u: 'pct', grp: 'Home', v: 0.01, by: 'repairs, insurance and maintenance', ...lm('LifeMap planning standard (no official figure exists)') },
  ownShare: { n: 'Share of pension contributions you pay yourself', u: 'pct', grp: 'Retirement', v: 0.5, by: 'a common 5% + 5% split with your employer; 100% if self-employed', ...lm('Pensions Authority and My Future Fund (auto-enrolment) contribution split, 2026'), guide: 'Your payslip shows what comes out of your pay. Only your own share gets tax relief.' },
  retireMult: { n: 'Retirement savings target: times the yearly income needed', u: 'num', grp: 'Retirement', v: 25, by: 'a common rule of thumb, about 4% a year', ...lm('Widely used 4% sustainable-withdrawal rule of thumb (W. Bengen, 1994)'), guide: 'Retiring early or planning to 95 needs more.' },
  retireSpend: { n: "Retirement spending if no goal (share of today's spending)", u: 'pct', grp: 'Retirement', v: 0.8, by: 'most people spend a bit less once work costs and the mortgage stop', ...lm('LifeMap planning standard. Reference points: Pensions Authority and Society of Actuaries in Ireland guidance') },
  accessAge: { n: 'Pension access age (earliest age you can draw your pension)', u: 'choice', grp: 'Retirement', v: 60, by: 'most pensions can be drawn from 60; some occupational schemes allow 50', src: 'Revenue Commissioners: pension benefits can usually be taken from 60; some occupational schemes allow 50', asat: '2026', verify: true, guide: 'We assume 60. Choose 50 only if your occupational scheme says it allows it.' },
  lumpSum: { n: 'Tax-free lump sum to take (share of pension; law limit 25%)', u: 'pct', grp: 'Retirement', v: 0.25, by: 'most people take the full tax-free amount', ...lm('Revenue Commissioners: tax-free retirement lump sum, up to 25% of the fund'), asat: 'Law limit 25%' },
  safetyMonths: { n: 'Emergency fund: months of essential spending', u: 'num', grp: 'Emergency fund & saving', v: 6, by: '6 months for a single income or self-employed, 3 for two secure incomes', ...lm('LifeMap planning standard. Reference points: MABS and CCPC guidance on 3 to 6 months of essential spending'), guide: 'Easy-access cash for surprises or a gap in pay.' },
  safetyMonthsTwo: { n: 'Emergency fund: months with two secure incomes', u: 'num', grp: 'Emergency fund & saving', v: 3, by: 'two secure incomes', ...lm('LifeMap planning standard. Reference points: MABS and CCPC guidance') },
  cashYears: { n: 'Money for goals sooner than this is kept as cash (years)', u: 'yrs', grp: 'Emergency fund & saving', v: 5, by: 'money needed within 5 years is usually kept as cash', ...lm('LifeMap planning standard (money needed within about 5 years is not invested)'), guide: 'Longer-term money has more time to ride out ups and downs.' },
  investShare: { n: 'Spare savings: share invested', u: 'pct', grp: 'Emergency fund & saving', v: 0.4, by: 'a balanced cash and invested mix', ...lm('LifeMap planning standard (a balanced cash and invested mix)') },
  cgtGain: { n: 'Other assets: share of the value that is a gain', u: 'pct', grp: 'Emergency fund & saving', v: 0.4, by: 'a planning figure, because we do not know what you paid', ...lm('LifeMap planning standard. Capital gains tax applies to the gain only.') },
  saveShare: { n: 'Share of spare money saved, at most', u: 'pct', grp: 'Emergency fund & saving', v: 0.5, by: 'half of your spare money', ...lm(), guide: 'We never count more than this share of your spare money as saved, unless you set your own monthly saving.' },
  noAnswer: { n: 'Monthly saving if not answered', u: 'eur', grp: 'Emergency fund & saving', v: 300, by: 'a modest regular amount', ...lm(), guide: 'Used until you say how much you could comfortably invest each month.' },
  lifeShare: { n: 'Life cover: share of income the family needs', u: 'pct', grp: 'Protection', v: 0.6, by: 'families usually need less than full pay', ...lm('LifeMap planning standard. Reference point: Irish life-insurer needs calculators') },
  lifeYears: { n: 'Life cover: years of support', u: 'yrs', grp: 'Protection', v: 15, by: 'often until your youngest child is 23', ...lm('LifeMap planning standard. Reference point: Irish life-insurer needs calculators') },
  riskMu: { n: 'Risk and return: growth a year, Cautious / Balanced / Growth', u: 'pct3', grp: 'Risk and budget', v: [0.02, 0.04, 0.06], by: 'illustrations, not forecasts', ...lm('LifeMap illustrations, not forecasts'), guide: "Your adviser uses the fund's own risk rating (SRI 1-7)." },
  riskVol: { n: 'Risk and return: ups and downs, Cautious / Balanced / Growth', u: 'pct3', grp: 'Risk and budget', v: [0.05, 0.1, 0.16], by: 'illustrations, not forecasts', ...lm('LifeMap illustrations, not forecasts'), guide: 'How much a year can swing.' },
  budget: { n: 'Budget split: needs / wants / savings and debt', u: 'pct3', grp: 'Risk and budget', v: [0.5, 0.3, 0.2], by: 'the 50/30/20 rule', ...lm('The 50/30/20 budgeting rule (Warren and Warren Tyagi, 2005)') },
  bands: { n: 'Tax bands in future', u: 'choice', grp: 'Choices', v: 'prices', by: 'Budgets have broadly kept pace over time', ...lm('Department of Finance Budget history (tax bands and credits, 2015 to 2026)'), guide: "Irish tax bands are set each Budget. 'Stay as today' is the cautious view (more tax later)." },
  spGrow: { n: 'State Pension in future', u: 'choice', grp: 'Choices', v: 'prices', by: 'it has broadly kept pace with prices over time', ...lm('Department of Social Protection weekly State Pension rate history'), guide: 'The State Pension is set each Budget.' },
  drawRule: { n: 'How you draw your pension', u: 'choice', grp: 'Choices', v: 'spread', by: 'spread over your plan, at least the legal minimum', ...lm('Revenue Commissioners: ARF minimum annual distribution (4% from 61, 5% from 71; 6% over 2m)') },
  ddTiming: { n: 'Drawdown tools: withdrawals taken at the', u: 'choice', grp: 'Choices', v: 'start', by: 'the prudent choice: the money has less time to grow before you take it', ...lm('LifeMap tool setting') },
  waitYears: { n: 'Lump sum tool: years you might wait before investing', u: 'yrs', grp: 'Choices', v: 5, by: 'an illustration of the cost of waiting', ...lm('LifeMap tool setting') },
  style: { n: 'Risk and return tool: investment style (1 Cautious, 2 Balanced, 3 Growth)', u: 'num', grp: 'Choices', v: 2, by: 'Balanced; an adviser checks your attitude to risk', ...lm('LifeMap tool setting') },
} as const satisfies Record<string, Entry>

// Market rates: chips, never pre-filled. v:null = no published figure, so no suggestion (never invent one).
const cbi = (n: string, v: number | null, what: string, guide: string): Entry => ({ n, u: 'pct', grp: 'Market rates', v, by: v == null ? 'No published average' : `Central Bank of Ireland: average rate on ${what}, Jul 2026`, src: CBI, asat: v == null ? '-' : 'Jul 2026', verify: true, guide })
export const MARKET = {
  mortRate: cbi('Suggested mortgage rate', 0.0348, 'new mortgages', 'Your mortgage statement shows your rate. Typing it is fine: no upload needed.'),
  loanRate: cbi('Suggested personal and car loan rate (APR)', 0.0672, 'new consumer loans', 'Your loan agreement shows your APR.'),
  cardRate: cbi('Suggested credit card rate (APR)', null, '', 'Your card statement shows your APR.'),
  depRate: cbi('Suggested deposit rate (fixed term, before 33% DIRT)', 0.0192, 'new fixed-term household deposits', 'If you rent, your deposit stays in savings.'),
  buyFees: { n: 'Suggested buying fees (legal and survey)', u: 'eur', grp: 'Market rates', v: null, by: 'No published figure', src: 'No published figure', asat: '-', verify: false },
  infl: { n: 'Inflation: prices rise (a year)', u: 'pct', grp: 'Market rates', v: 0.02, by: 'the ECB target for the long term', src: 'https://www.bundesbank.de/en/tasks/topics/european-central-bank-updates-monetary-policy-strategy-970824', asat: '2025 strategy', verify: true },
  fundChg: { n: 'Suggested fund and pension charges (a year)', u: 'pct', grp: 'Market rates', v: 0.01, by: 'Pensions Authority pension calculator assumption', src: 'https://pensionsauthority.ie/scheme-members-and-prsa-contributors/pension-calculator/assumptions/ · https://www.ccpc.ie/consumers/money/pensions/fees-and-charges/', asat: '2026', verify: true, guide: 'Usually between 0.5% and 2% a year (CCPC). When your statement shows your own charges, we use them instead of this.' },
} as const satisfies Record<string, Entry>
