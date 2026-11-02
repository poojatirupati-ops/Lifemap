import { lumpSum } from '../planning/pensions.ts'
import { euro } from '../../lib/format.ts'
import { grownContributions } from './maths.ts'
import type { Calculator } from './types.ts'
import { RETIREMENT_INPUTS, RETIREMENT_WHAT_IFS } from './retirementInputs.data.ts'
import { NO_INFLATION, years } from './words.ts'
import { todayOf, blockedRetirement } from './retire.shared.ts'
import { earlyWarning, fundThresholdWarning, retirementLine } from './retirementWords.ts'

export const retirement: Calculator = {
  id: 'retirement',
  inputs: RETIREMENT_INPUTS,
  whatIfs: RETIREMENT_WHAT_IFS,
  run(figures, context) {
    const {
      age,
      ra: targetAge,
      pot,
      m: monthly,
      d: wantedIncome,
      o: otherIncome,
      g: growthPercent,
      later = 0,
      more = 0,
      less = 0,
    } = figures
    const { rules, assumption, pensionStatement: statement } = context
    const retireAt = targetAge + later
    if (retireAt <= age) return blockedRetirement(age)
    const term = retireAt - age
    const growth = growthPercent / 100
    const ours =
      pot * (1 + growth) ** term + grownContributions(monthly + more, growth, context.wage, term)
    const statementFund =
      statement?.proj != null &&
      retireAt === statement.nra &&
      !more &&
      context.untouched(['pot', 'm', 'g', 'age'])
        ? statement.proj
        : null
    const useStatement = statementFund != null
    const fund = statementFund ?? ours
    const statementInToday = useStatement && (statement?.projToday || 'Yes') !== 'No'
    const fundToday = statementInToday ? fund : todayOf(fund, term, context)
    const income = wantedIncome - less
    const bridge = Math.max(0, rules.sp.age - retireAt)
    // the bridge never needs more than the income you need
    const target =
      Math.max(0, income - otherIncome) * Number(assumption('retireMult')) +
      bridge * Math.min(otherIncome, Math.max(0, income))
    const gap = fundToday == null ? null : target - fundToday
    const lumpShare = Number(assumption('lumpSum'))
    const lump = lumpSum(rules, fund, lumpShare)
    const early = retireAt < Number(assumption('accessAge')) ? earlyWarning(rules) : ''
    const sft = fundToday != null ? fundThresholdWarning(fundToday, rules, context.inflation) : ''
    const statementRows: [string, string][] =
      statement?.proj != null
        ? [
            [`Your statement projects (age ${statement.nra})`, euro(statement.proj)],
            [`On our assumptions (age ${retireAt})`, euro(ours)],
          ]
        : []
    return {
      label: "Illustrative gap (today's money)",
      value: gap == null ? NO_INFLATION : gap > 0 ? euro(gap) : 'On track: no gap',
      line: retirementLine({ fundToday, target, early, sft, lumpShare, rules, wage: context.wage }),
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
      goal: {
        kind: 'retire',
        name: 'Retire comfortably',
        emoji: '🌅',
        amount: income,
        age: retireAt,
      },
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
