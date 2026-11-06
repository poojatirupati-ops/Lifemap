// Type 1 assumptions: set by law, the same for everyone, shown but never editable.
import { taxYearFor, type Rules } from './rates.ts'
import { euro, euroWeekly, percent } from '../../lib/format.ts'

// en-US: en-GB writes September as "Sept"
const shortMonth = new Intl.DateTimeFormat('en-US', { month: 'short' })
const monthName = (month: number) => shortMonth.format(new Date(2026, month - 1, 1))

const NEW_ACCOUNT_ROW: [string, string] = [
  'New Investment Account (announced)',
  'Budget 2027 sets up the legal framework for a new Investment Account. The limits and tax details are not published yet, so it is not in your plan.',
]

/** [title, what the law sets] for the plan year's rules. */
export function governmentRules(rules: Rules, year: number): [string, string][] {
  const { it, usc, pen, sp, home, ae, sav, prsi } = rules
  return [
    [
      'Income tax',
      `20% up to ${euro(it.band)} (single; ${euro(it.bandMarried)} married, plus up to ${euro(it.bandUplift)} for a second income), 40% above. Personal credit ${euro(it.personal)} (${euro(it.personalMarried)} married), employee credit ${euro(it.paye)}`,
    ],
    [
      'USC',
      `${usc.bands.map((band) => percent(band[1])).join(' / ')} in bands; none if your income is ${euro(usc.exempt)} or less. The State Pension is exempt`,
    ],
    [
      'PRSI',
      `${prsi.path.map((step) => `${percent(step.r)} from ${monthName(step.m)} ${step.y}`).join(', ')}; none from ${prsi.endAge}`,
    ],
    [
      'Pension tax relief',
      `${pen.relief.map((band) => percent(band[1])).join(' / ')} of pay by age, on pay up to ${euro(pen.earnCap)}`,
    ],
    [
      'Retirement lump sum',
      `Up to ${percent(pen.lsMaxPct)} of the fund: ${euro(pen.lsTaxFree)} tax-free, the next ${euro(pen.lsCap - pen.lsTaxFree)} taxed at ${percent(pen.lsBandRate)}, anything above ${euro(pen.lsCap)} taxed at your marginal rate (${percent(it.r2)} here)`,
    ],
    [
      'Standard Fund Threshold',
      `${euro(pen.sft[2026])} in 2026, rising to ${euro(pen.sft[2029])} by 2029; ${percent(pen.sftRate)} tax above it`,
    ],
    [
      'Pension withdrawals',
      `From ${pen.earliestAge} at the earliest (50 for some occupational schemes); at least ${percent(pen.arfMin61)} a year from 61, ${percent(pen.arfMin71)} from 71 (${percent(pen.arfMinBig)} over ${euro(pen.arfBig)})`,
    ],
    [
      'State Pension (full rate)',
      `${euroWeekly(sp.week)} a week from ${sp.age} (${euro(sp.over80)} more from 80); Qualified Adult ${euroWeekly(sp.qa66)}`,
    ],
    [
      "Illness Benefit and survivor's pension",
      `${euroWeekly(sp.illness)} a week; survivor's pension ${euroWeekly(sp.survivor)} under 66, ${euroWeekly(sp.survivor66)} at 66+`,
    ],
    [
      'Auto-enrolment (My Future Fund)',
      `${percent(ae.ee)} you + ${percent(ae.er)} employer + ${percent(ae.state)} State, on pay up to ${euro(ae.earnCap)}`,
    ],
    [
      'Savings tax',
      `DIRT ${percent(sav.dirt)} on deposit interest; exit tax ${percent(sav.exit)} on funds and life policies, with a ${sav.deemed}-year deemed disposal`,
    ],
    [
      'Capital gains tax',
      `${percent(sav.cgt)} on gains above ${euro(sav.cgtExempt)} a year for each person (33% for disposals before 7 October 2026). Tax is due when you sell, not while you hold. Losses come off first. Development land stays at 33%.`,
    ],
    [
      'Gift and inheritance tax (CAT)',
      `Group A threshold ${euro(sav.cat)} (a child from a parent), from 7 October 2026. Not in your plan yet.`,
    ],
    ...(taxYearFor(year) === 2027 ? [NEW_ACCOUNT_ROW] : []),
    [
      'Mortgage limits (Central Bank)',
      `${home.ltiFTB}× income for first-time buyers, ${home.ltiSSB}× for others; at least a ${percent(1 - home.ltv)} deposit`,
    ],
    [
      'Stamp duty',
      `${percent(home.stamp[0][1])} up to ${euro(home.stamp[0][0])}, ${percent(home.stamp[1][1])} to ${euro(home.stamp[1][0])}, ${percent(home.stamp[2][1])} above`,
    ],
  ]
}
