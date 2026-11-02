// Report pages 10 and 11: what the plan assumes, and every year in numbers.
import { euro, euroWeekly, percent } from '../../lib/format.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import type { ReportContext } from './context.ts'
import { shortEuro } from './text.ts'

const GLOSSARY = (inflation: string, statePensionAge: number, weekly: string) => [
  ['Today’s money · future euros', 'Today’s prices, and amounts after prices rise.'],
  ['Inflation', `How fast prices rise. This plan uses ${inflation} a year.`],
  ['Shortfall', 'The part of a year’s costs your plan cannot pay.'],
  ['Covered %', 'How much of a goal’s cost your income and savings meet.'],
  ['PRSA · ARF', 'A personal pension account · a fund you draw income from.'],
  ['State Pension', `Government pension from ${statePensionAge}. Full rate ${weekly} a week.`],
  ['USC · PRSI', 'Irish charges on pay. PRSI builds your State Pension record.'],
  ['Capacity for loss', 'How much you could afford to lose.'],
  ['My Future Fund', 'Ireland’s automatic workplace pension.'],
]

export function assumptionsPages(context: ReportContext) {
  const { plan, settings, figures: f, rows, endAge, retirement, retired, gap } = context
  const rate = (key: string) => percent(assumption(settings.inputs, key))
  const inflation = percent(settings.growth.inflation)
  const weekly = euroWeekly(settings.rules.sp.week)
  const statePension =
    f.statePensionShare > 0
      ? `${euro(Math.round(settings.statePension * f.statePensionShare))} a year counted`
      : '€0 in this plan'
  const left = [
    ['Prices rise', `${inflation} a year`],
    ['Pay rises', `${rate('wage')} a year`],
    ['Cash grows', `${rate('cash')} a year, after DIRT`],
    ['Investments grow', `${rate('inv')} a year, after charges and exit tax`],
    ['Pensions grow', `${rate('pen')} working, ${rate('penRet')} once retired`],
    ['State Pension', `${statePension} (full rate ${weekly} a week)`],
  ]
  if (f.partner)
    left.push([
      'Partner',
      f.partnerAge
        ? `Age ${f.partnerAge}${plan.partnerRetireSet ? `, stops work at ${plan.partnerRetireAge}` : ''}`
        : 'Counted as your age',
    ])
  const right = [
    ['Tax', `${rows[0].year} Irish income tax, USC, PRSI`],
    [
      'Saved towards goals',
      `About ${euro(Math.round(context.projection.saving.savingMonthly))} a month`,
    ],
    ['Emergency fund', `${settings.bufferMonths} months kept aside`],
    ['Order of goals', plan.rank ? 'Your own ranking' : 'Must-haves, then soonest first'],
    [
      'Retirement age',
      retirement ? (retired ? 'Already retired' : String(f.retireAge)) : 'No retirement goal',
    ],
    ['Plan ends', `Age ${endAge}`],
  ]
  if (f.mortgageBalance > 0 && plan.figures.home === 'Own with mortgage')
    right.push([
      'Mortgage rate',
      rate('mortRate') + (plan.figures.mortRate ? ' (your statement)' : ' (assumed)'),
    ])

  const assumptions = {
    big: String(left.length + right.length),
    left,
    right,
    knownLimits: {
      items: [
        'Living costs stay the same through the plan, apart from prices.',
        'Drawdown is from an ARF or vested PRSA. Spare money not saved is assumed spent.',
        settings.startYear === 2027
          ? 'Budget 2027 rules (announced 6 Oct 2026) are used from 1 January 2027. The Finance Bill may still change some details.'
          : 'Irish rules checked 2 Oct 2026. Your plan starts in 2026, so Budget 2027 changes (from 1 January 2027) are not used.',
        'Capital gains tax is estimated on a share of the value of other assets, crypto, gold and art. Tax on life-policy lump sums, rental costs and gift or inheritance tax are not included yet.',
      ],
    },
    glossary: { items: GLOSSARY(inflation, context.statePensionAge, weekly) },
  }

  const appendix = {
    big: String(rows.length),
    rows: rows.map((row) => ({
      age: row.age,
      year: row.year,
      income: Math.round(row.inflow),
      needs: Math.round(row.needs),
      shortfall: Math.round(row.shortfall),
      savingsLeft: Math.round(row.liquid),
    })),
    note: gap.runOut
      ? `Future euros. ${gap.rows.length} shortfall years sum to ${euro(gap.future)} (future euros) or about ${shortEuro(gap.today)} in today’s money.`
      : 'Future euros. No shortfall years: your income and savings cover every year.',
  }
  return { assumptions, appendix }
}
