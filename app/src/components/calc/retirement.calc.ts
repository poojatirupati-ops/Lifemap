import { LAW_TEXT } from '../../domain/planning/rates.ts'
import { lumpSum, standardFundThreshold } from '../../domain/planning/pensions.ts'
import { euro, percent } from '../../lib/format.ts'
import { grownContributions } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { NO_INFLATION, years } from './words.ts'
import { todayOf, blockedRetirement } from './retire.shared.ts'

export const retirement: Calculator = {
  id: 'retirement',
  inputs: [
    input('age', 'Your age', 40, 20, 70, 1, 'age'),
    input('ra', 'Target retirement age', 65, 21, 104, 1, 'age'),
    input('pot', 'Pension value today', 60000, 0, 1500000, 1000, '€'),
    input('m', 'Monthly contributions (you + employer)', 500, 0, 5000, 10, '€'),
    input(
      'd',
      "Desired yearly income in retirement (today's money, before tax)",
      40000,
      10000,
      150000,
      1000,
      '€',
    ),
    input(
      'o',
      "Other yearly income, e.g. State Pension (today's money)",
      15000,
      0,
      50000,
      500,
      '€',
    ),
    input('g', 'Growth after charges', 4.5, 1, 7, 0.25, '%'),
  ],
  whatIfs: [
    input('later', 'Retire later by', 0, 0, 5, 1, 'y'),
    input('more', 'Save more each month', 0, 0, 1500, 50, '€'),
    input('less', 'Spend less in retirement (a year)', 0, 0, 20000, 500, '€'),
  ],
  run(v, context) {
    const { rules, assumption } = context
    const retireAt = v.ra + (v.later || 0)
    if (retireAt <= v.age) return blockedRetirement(v.age)
    const term = retireAt - v.age
    const growth = v.g / 100
    const ours =
      v.pot * (1 + growth) ** term +
      grownContributions(v.m + (v.more || 0), growth, context.wage, term)
    const statement = context.pensionStatement
    const useStatement =
      !!statement &&
      statement.proj != null &&
      retireAt === statement.nra &&
      !v.more &&
      context.untouched(['pot', 'm', 'g', 'age'])
    const fund = useStatement ? statement!.proj! : ours
    const statementInToday = useStatement && (statement!.projToday || 'Yes') !== 'No'
    const fundToday = statementInToday ? fund : todayOf(fund, term, context)
    const income = v.d - (v.less || 0)
    const bridge = Math.max(0, rules.sp.age - retireAt)
    // the bridge never needs more than the income you need
    const target =
      Math.max(0, income - v.o) * Number(assumption('retireMult')) +
      bridge * Math.min(v.o, Math.max(0, income))
    const gap = fundToday == null ? null : target - fundToday
    const lumpShare = Number(assumption('lumpSum'))
    const lump = lumpSum(rules, fund, lumpShare)
    const early =
      retireAt < Number(assumption('accessAge'))
        ? `Most pensions can't be taken before ${rules.pen.earliestAge} (PRSA and personal pensions; some occupational schemes allow it from 50). Until then you would live on savings and other income. `
        : ''
    // today's money against the 2026 threshold, like with like
    const sft =
      fundToday != null && fundToday > standardFundThreshold(rules, 2026, context.inflation ?? 0)
        ? "Your fund in today's money is above the Standard Fund Threshold (€2.2m in 2026, rising to €2.8m by 2029; later years are not set yet): the excess is taxed at 40%. "
        : ''
    const maxLump = Math.round(rules.pen.lsMaxPct * 100)
    const lumpWords =
      lumpShare > 0
        ? `Here ${Math.round(lumpShare * 100)}% of the fund is taken as a lump sum (the most allowed is ${maxLump}%): `
        : `No lump sum is assumed (the most allowed is ${maxLump}%): `
    const opening =
      gap == null
        ? "Choose your inflation rate to compare your fund with the target in today's money. "
        : gap > 0
          ? `Your projected fund is worth about ${euro(fundToday!)} in today's money, against a target of ${euro(target)}. `
          : 'On these assumptions your projected fund meets the illustrative target. '
    const statementRows: [string, string][] =
      statement && statement.proj != null
        ? [
            [`Your statement projects (age ${statement.nra})`, euro(statement.proj)],
            [`On our assumptions (age ${retireAt})`, euro(ours)],
          ]
        : []
    return {
      label: "Illustrative gap (today's money)",
      value: gap == null ? NO_INFLATION : gap > 0 ? euro(gap) : 'On track: no gap',
      line: `${opening}${early}${sft}Contributions are assumed to rise with pay (${percent(context.wage)} a year), as in your plan. The target includes the State Pension you fund yourself for each year you retire before 66. Desired income and the State Pension are before tax: the State Pension is taxable (USC-exempt) and drawdown pays income tax and USC. ${lumpWords}${LAW_TEXT.lumpSum}. Contributions are counted as paid at the end of each year.`,
      rows: [
        [
          useStatement
            ? 'Projected fund at retirement (from your statement)'
            : 'Projected fund at retirement',
          euro(fund),
        ],
        ["Projected fund in today's money", fundToday == null ? NO_INFLATION : euro(fundToday)],
        [
          `Illustrative target (${assumption('retireMult')} × the income you need${bridge ? ` + ${years(bridge)} before the State Pension` : ''}, today's money)`,
          euro(target),
        ],
        ['Lump sum you could take (after tax)', euro(lump.net)],
        ['Retiring at', String(retireAt)],
        ...statementRows,
      ],
      goal: { kind: 'retire', name: 'Retire comfortably', em: '🌅', amount: income, age: retireAt },
      numbers: {
        Gap_Today: gap ?? NO_INFLATION,
        Projected_Fund: fund,
        Fund_Today: fundToday ?? NO_INFLATION,
        Calculated_Fund: ours,
        Target_Today: target,
        Years_To_Retirement: term,
        Bridge_Years: bridge,
        Lump_Sum: lump.gross,
        Lump_Sum_Tax: lump.tax,
        Lump_Sum_Net: lump.net,
        Early_Warning: early.trim(),
        SFT_Warning: sft.trim(),
        Use_Statement_Projection: useStatement ? 'Yes' : 'No',
        Plan_Goal_Income: income,
        Plan_Goal_Age: retireAt,
      },
    }
  },
}
