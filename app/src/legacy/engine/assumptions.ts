// Assumptions as data (ported from the prototype's AS, ASM and SAVE). Data only: no logic.
// ASM keeps each assumption's static metadata (including static by/help text and rng, derived from RI). Left to the planning context: the closures (sug, need, fb) and the by/help copy built from standards, guidance or LAW (e.g. buyFees, lumpSum, drawRule, cardRate, planEnd help; by for the standards).
import { RI } from './rates.ts'

// ty: 1 law (RULES_IE_2026), 2 range (customer enters theirs), 3 personal judgement (chosen, with a standard to suggest).
export type AssumptionMeta = {
  readonly g: (typeof ASM_GROUPS)[number][0]
  readonly b: string
  readonly ty: 2 | 3
  readonly n: string
  readonly l: string
  readonly t: 'pct' | 'eur' | 'eurw' | 'yrs' | 'num' | 'age' | 'choice'
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly o?: readonly (readonly [string | number, string])[]
  readonly mk?: string
  readonly opt?: boolean
  readonly own?: boolean
  readonly afterDirt?: boolean
  readonly by?: string
  readonly help?: string
  readonly rng?: readonly [number, number]
}

// Weekly DSP rates keep their cents (€299.30, €254).
const eurW = (n: number) => '€' + (Math.abs(n % 1) > 1e-9 ? n.toFixed(2) : String(Math.round(n)))

// Standards, suggested only, never applied as a default; owned by the settings register (T12). Do not read AS as a silent fallback:
// wage, cash, inv, pen, penRet are sec 14 type-3 choices (blank until the customer chooses or taps "Use the standard");
// mortRate, cardRate, loanRate are type-2 market rates (chips, never pre-filled). Kept for the prototype comparison. A year unless stated; sp is the full State Pension a year.
// No plan-until age and no inflation here: both are the customer's own choice (sec 14, 22), never defaulted.
export const AS = {
  wage: 0.03, cash: 0.01, inv: 0.035, pen: 0.045, penRet: 0.0315,
  sp: RI.sp.week * 52, spAge: RI.sp.age, mortRate: 0.0375, cardRate: 0.2, loanRate: 0.08,
} as const

export const ASM_GROUPS = [['prices', 'Prices & growth'], ['retire', 'Retirement'], ['safety', 'Emergency fund & debt'], ['length', 'Plan length']] as const

export const ASM = {
  inv: {g:"prices",b:"B3",ty:3,n:"investment growth",l:"Investments grow (a year, after charges and tax)",t:"pct",min:0,max:7,step:0.25},
  invGross: {g:"prices",b:"B3",ty:3,n:"growth before fees",l:"Investments grow before fees and tax (a year; the growth and fees tools)",t:"pct",min:0,max:10,step:0.25},
  cash: {g:"prices",b:"B4",ty:3,n:"cash growth",l:"Cash savings earn (a year, after DIRT)",t:"pct",min:0,max:4,step:0.05},
  pen: {g:"prices",b:"B5",ty:3,n:"pension growth",l:"Pension grows while you work (a year, after charges)",t:"pct",min:0,max:7,step:0.05},
  penRet: {g:"prices",b:"B5",ty:3,n:"pension growth once retired",l:"Pension grows once you retire (a year, after charges)",t:"pct",min:0,max:7,step:0.05},
  penChg: {g:"prices",b:"B6",ty:2,n:"typical pension charges",l:"Typical pension charges already allowed for in the pension growth above",t:"pct",min:0,max:2.5,step:0.05,mk:"fundChg",by:"pension charges; your statement shows yours"},
  wage: {g:"prices",b:"B8",ty:3,n:"pay rises",l:"Pay rises (a year)",t:"pct",min:0,max:6,step:0.1},
  bands: {g:"prices",b:"B10",ty:3,n:"tax bands in future",l:"Tax bands in future",t:"choice",o:[["prices","Rise with prices"],["flat","Stay as today"]]},
  rentRise: {g:"prices",b:"B25",ty:3,n:"rent rises",l:"Rent vs buy: rent rises (a year)",t:"pct",min:0,max:8,step:0.5},
  houseGrow: {g:"prices",b:"B25",ty:3,n:"house price growth",l:"Rent vs buy: house prices rise (a year)",t:"pct",min:0,max:6,step:0.5},
  upkeep: {g:"prices",b:"B25",ty:3,n:"upkeep",l:"Rent vs buy: upkeep a year (share of the home value)",t:"pct",min:0,max:3,step:0.1},
  buyFees: {g:"prices",b:"B25",ty:2,n:"buying fees",l:"Buying fees (legal and survey), plus stamp duty",t:"eur",min:0,max:10000,step:250,mk:"buyFees",opt:true},
  depEarn: {g:"prices",b:"B25",ty:2,n:"the deposit's earning rate",l:"Rent vs buy: what the deposit could earn instead (a year, after tax)",t:"pct",min:0,max:6,step:0.25,mk:"depRate",opt:true,afterDirt:true},
  riskMu1: {g:"prices",b:"B26",ty:3,n:"the Cautious style growth",l:"Risk & return: Cautious style growth (a year)",t:"pct",min:0,max:8,step:0.5},
  riskMu2: {g:"prices",b:"B26",ty:3,n:"the Balanced style growth",l:"Risk & return: Balanced style growth (a year)",t:"pct",min:0,max:8,step:0.5},
  riskMu3: {g:"prices",b:"B26",ty:3,n:"the Growth style growth",l:"Risk & return: Growth style growth (a year)",t:"pct",min:0,max:8,step:0.5},
  riskVol1: {g:"prices",b:"B26",ty:3,n:"the Cautious style ups and downs",l:"Risk & return: Cautious style ups and downs (volatility)",t:"pct",min:0,max:25,step:1},
  riskVol2: {g:"prices",b:"B26",ty:3,n:"the Balanced style ups and downs",l:"Risk & return: Balanced style ups and downs (volatility)",t:"pct",min:0,max:25,step:1},
  riskVol3: {g:"prices",b:"B26",ty:3,n:"the Growth style ups and downs",l:"Risk & return: Growth style ups and downs (volatility)",t:"pct",min:0,max:25,step:1},
  spGrow: {g:"retire",b:"B11",ty:3,n:"State Pension in future",l:"State Pension in future",t:"choice",o:[["prices","Rises with prices"],["pay","Rises with pay"],["flat","Stays flat"]]},
  spYears: {g:"retire",b:"B9",ty:2,n:"PRSI years",l:"How many years of PRSI will you have at 66? (leave blank if you don't know)",t:"yrs",min:0,max:45,step:1,rng:[RI.sp.minYears,RI.sp.fullYears],by:`DSP: ${RI.sp.fullYears} for the full rate, at least ${RI.sp.minYears} to qualify`,opt:true,help:"Check your record on MyWelfare. If you give your years, we work out your State Pension from them (set by law)."},
  spWeek: {g:"retire",b:"B9",ty:2,n:"State Pension",l:"Your State Pension a week at 66",t:"eurw",min:0,max:RI.sp.week,step:0.1,rng:[0,RI.sp.week],by:`DSP 2026: the full rate needs ${RI.sp.fullYears} years of PRSI; partial rates are lower`,help:"Your State Pension statement on MyWelfare shows your expected rate. Or tell us your PRSI years."},
  pSpWeek: {g:"retire",b:"B9",ty:2,n:"partner's State Pension",l:"Your partner's State Pension a week at 66",t:"eurw",min:0,max:RI.sp.week,step:0.1,rng:[0,RI.sp.week],by:"DSP 2026",help:"Their MyWelfare statement shows it."},
  ownShare: {g:"retire",b:"B1",ty:3,n:"share of your pension you pay",l:"Of the money paid into your pension each month, the share you pay yourself (the rest is your employer)",t:"pct",min:0,max:100,step:5},
  retireMult: {g:"retire",b:"B17",ty:3,n:"retirement savings target",l:"Retirement savings target: times the yearly income you need",t:"num",min:20,max:33,step:1},
  retireSpend: {g:"retire",b:"B18",ty:3,n:"retirement spending",l:"Retirement spending if you haven't set a goal (share of today's spending)",t:"pct",min:50,max:120,step:5},
  lumpSum: {g:"retire",b:"B19",ty:3,n:"retirement lump sum",l:"Tax-free lump sum to take at retirement (share of your pension, 0% = none)",t:"pct",min:0,max:25,step:1},
  accessAge: {g:"retire",b:"B20",ty:3,n:"pension access age",l:"Earliest age you can draw your pension",t:"choice",o:[[60,"From 60 (most pensions)"],[50,"From 50 (some occupational schemes)"]]},
  drawRule: {g:"retire",b:"B20",ty:3,n:"how you draw your pension",l:"How you draw your pension",t:"choice",o:[["spread","Spread to plan end"],["min","Minimum only (4% / 5%)"],["fixed","Fixed amount"]]},
  ddTiming: {g:"retire",b:"B20",ty:3,n:"withdrawal timing",l:"Drawdown tools: withdrawals taken at the",t:"choice",o:[["start","Start of the year"],["end","End of the year"]],help:""},
  drawFixed: {g:"retire",b:"B20",ty:3,n:"fixed yearly amount",l:"Fixed amount a year (today's money), if you chose \"Fixed amount\"",t:"eur",min:0,max:200000,step:500,own:true,help:"Never less than the legal minimum once you are 61."},
  safetyMonths: {g:"safety",b:"B16",ty:3,n:"emergency fund months",l:"Emergency fund: months of essential spending",t:"num",min:1,max:12,step:1},
  mortRate: {g:"safety",b:"B13",ty:2,n:"mortgage rate",l:"Your mortgage rate (if your statement doesn't say)",t:"pct",min:1,max:8,step:0.05,mk:"mortRate"},
  cardRate: {g:"safety",b:"B14",ty:2,n:"credit-card rate",l:"Your credit-card rate, APR (if your statement doesn't say)",t:"pct",min:0,max:35,step:0.5,mk:"cardRate"},
  loanRate: {g:"safety",b:"B15",ty:2,n:"loan rate",l:"Your other loans rate, APR (if your statement doesn't say)",t:"pct",min:0,max:25,step:0.25,mk:"loanRate"},
  cashYears: {g:"safety",b:"B21",ty:3,n:"years kept as cash",l:"Money for goals sooner than this is kept as cash (years)",t:"yrs",min:1,max:10,step:1},
  investShare: {g:"safety",b:"B21",ty:3,n:"share of spare savings invested",l:"Spare savings: share invested (the rest stays in cash)",t:"pct",min:0,max:100,step:5},
  cgtGain: {g:"safety",b:"B28",ty:3,n:"gain share when assets are sold",l:"Other assets, crypto, gold or art: share of their value that is a gain (for capital gains tax when sold)",t:"pct",min:0,max:100,step:5},
  saveShare: {g:"safety",b:"B22",ty:3,n:"share of spare money saved",l:"Share of your spare money you save, at most",t:"pct",min:0,max:100,step:5},
  noAnswer: {g:"safety",b:"B22",ty:3,n:"monthly saving",l:"Monthly saving if you haven't told us how much you could invest",t:"eur",min:0,max:5000,step:25},
  lifeShare: {g:"safety",b:"B24",ty:3,n:"share of income your family would need",l:"Life cover: share of your income your family would need",t:"pct",min:30,max:100,step:5},
  lifeYears: {g:"safety",b:"B24",ty:3,n:"years of support",l:"Life cover: years your family would need support",t:"yrs",min:1,max:30,step:1},
  survivor: {g:"safety",b:"B24",ty:2,n:"survivor's pension",l:"Life cover: State survivor's pension a week",t:"eurw",min:0,max:400,step:0.5,rng:[0,RI.sp.survivor66],by:`DSP 2026: ${eurW(RI.sp.survivor)} under 66, ${eurW(RI.sp.survivor66)} at 66+, nothing if not eligible`,help:"Cohabiting partners can now qualify (Bereaved Partner's Pension)."},
  budgetNeeds: {g:"safety",b:"B27",ty:3,n:"budget split",l:"Budget split: needs",t:"pct",min:0,max:100,step:5},
  budgetWants: {g:"safety",b:"B27",ty:3,n:"budget split",l:"Budget split: wants",t:"pct",min:0,max:100,step:5},
  budgetSave: {g:"safety",b:"B27",ty:3,n:"budget split",l:"Budget split: savings and debt",t:"pct",min:0,max:100,step:5},
  planEnd: {g:"length",b:"B12",ty:3,n:"plan-until age",l:"Plan until age (life expectancy)",t:"age",min:50,max:100,step:1,own:true},
  startYear: {g:"length",b:"B23",ty:3,n:"plan start year",l:"Start the plan in",t:"choice",o:[[2026,"2026"],[2027,"2027"]],by:"from October most of this year has passed",help:"Choose 2027 to use the Budget 2027 tax rules (announced 6 October 2026) from 1 January 2027: higher tax bands and credits, a wider 2% USC band, a €10 higher State Pension and exit tax at 35%. The Finance Bill may still change some details."},
} as const satisfies Record<string, AssumptionMeta>

export const SAVE = {
  band: [50, 200, 500, 1000, null], // Q6 option index -> monthly amount, today's money (band midpoint; "Over €750" -> €1,000; "varies" -> share only)
  share: 0.5, // at most half of the measured monthly spare money is saved
  shareVaries: 0.33, // "It changes month to month": a third
  noAnswer: 300, // Q6 not answered: €300 a month cap (shown as an assumption)
  buffer: 6, // B16: months of essential spending kept back as an emergency buffer when there is no emergency fund goal
  longYrs: 5, // goals 5+ years away grow at the investment rate, sooner ones at the cash rate
} as const
