// Pensions & Retirement: projection, contributions, AVCs, how long money lasts, drawdown scenarios.
import { lumpSum, standardFundThreshold } from '../planning/pensions.ts'
import { LAW_TEXT, type Rules } from '../planning/rates.ts'
import { euro, percent } from '../../lib/format.ts'
import { grownContributions, grownSaving, MAX_YEARS, reliefLimit, yearsLasting } from './maths.ts'
import type { CalcContext, Calculator, Figures } from './types.ts'
import { inflationLine, inflationText, NO_INFLATION, years } from './words.ts'

const NO_RETIRE_AGE = 'Choose a retirement age after your age to see this'
const TAX_NOTE =
  'Desired income and the State Pension are before tax: the State Pension is taxable (USC-exempt) and drawdown pays income tax and USC. '

const todayOf = (future: number, term: number, { inflation }: CalcContext) =>
  inflation == null ? null : future / (1 + inflation) ** term

/** Tax relief on contributions, within the age band and earnings cap, after what is paid in already. */
function relief(figures: Figures, yearly: number, context: CalcContext) {
  const { pen } = context.rules
  const share = reliefLimit(context.rules, figures.age)
  const limit = share * Math.min(figures.sal, pen.earnCap)
  const room = Math.max(0, limit - figures.ex)
  const relievedYearly = Math.min(yearly, room)
  const sentence = `Tax relief has an age limit: at ${figures.age} it applies to up to ${Math.round(share * 100)}% of your earnings (earnings counted up to ${euro(pen.earnCap)}), which is ${euro(limit)} a year`
  return {
    limit,
    room,
    relievedYearly,
    monthly: (relievedYearly * figures.tr) / 100 / 12,
    sentence,
  }
}

function blockedRetirement(age: number) {
  const names = [
    'Gap_Today',
    'Projected_Fund',
    'Fund_Today',
    'Calculated_Fund',
    'Target_Today',
    'Years_To_Retirement',
    'Bridge_Years',
    'Lump_Sum',
    'Lump_Sum_Tax',
    'Lump_Sum_Net',
  ]
  return {
    label: "Illustrative gap (today's money)",
    value: NO_RETIRE_AGE,
    line: `Your retirement age has to be after your age today (${age}), so the tool can count the years you still have to save.`,
    rows: [],
    goal: { kind: 'blocked', message: 'Choose a retirement age after your age first' },
    numbers: {
      ...Object.fromEntries(names.map((name) => [name, NO_RETIRE_AGE])),
      Early_Warning: '',
      SFT_Warning: '',
      Use_Statement_Projection: NO_RETIRE_AGE,
      Plan_Goal_Income: NO_RETIRE_AGE,
      Plan_Goal_Age: NO_RETIRE_AGE,
    },
  }
}

const earlyWarning = ({ pen }: Rules) =>
  `Most pensions can't be taken before ${pen.earliestAge} (PRSA and personal pensions; some occupational schemes allow it from 50). Until then you would live on savings and other income. `

/** Today's money against the 2026 threshold, like with like. */
const fundThresholdWarning = (fundToday: number, rules: Rules, inflation: number | null) =>
  fundToday > standardFundThreshold(rules, 2026, inflation ?? 0)
    ? "Your fund in today's money is above the Standard Fund Threshold (€2.2m in 2026, rising to €2.8m by 2029; later years are not set yet): the excess is taxed at 40%. "
    : ''

function lumpSumWords(share: number, { pen }: Rules) {
  const most = `(the most allowed is ${Math.round(pen.lsMaxPct * 100)}%)`
  return share > 0
    ? `Here ${Math.round(share * 100)}% of the fund is taken as a lump sum ${most}: `
    : `No lump sum is assumed ${most}: `
}

/** The opening sentence under the retirement result. */
function fundSentence(fundToday: number | null, target: number) {
  if (fundToday == null)
    return "Choose your inflation rate to compare your fund with the target in today's money. "
  return fundToday < target
    ? `Your projected fund is worth about ${euro(fundToday)} in today's money, against a target of ${euro(target)}. `
    : 'On these assumptions your projected fund meets the illustrative target. '
}

const atYearEnd = (context: CalcContext) => context.assumption('ddTiming') === 'end'
const lastingText = (count: number | null) =>
  count == null
    ? NO_INFLATION
    : count >= MAX_YEARS
      ? '60+ years'
      : count < 1
        ? 'Less than a year'
        : years(count)

export const RETIRE: Record<string, Calculator['run']> = {
  retirement(figures, context) {
    const { age, ra: targetAge, pot, m: monthly, d: wantedIncome, o: otherIncome } = figures
    const { g: growthPercent, later = 0, more = 0, less = 0 } = figures
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
      line: [
        fundSentence(fundToday, target),
        early,
        sft,
        `Contributions are assumed to rise with pay (${percent(context.wage)} a year), as in your plan. `,
        'The target includes the State Pension you fund yourself for each year you retire before 66. ',
        TAX_NOTE,
        lumpSumWords(lumpShare, rules),
        `${LAW_TEXT.lumpSum}. `,
        'Contributions are counted as paid at the end of each year.',
      ].join(''),
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

  contrib(figures, context) {
    const { sal: salary, inc: increasePercent, g: growthPercent, y: term } = figures
    const { tr: reliefRate, ex: paidAlready } = figures
    const monthly = (salary * increasePercent) / 100 / 12
    const grown = grownContributions(monthly, growthPercent / 100, context.wage, term)
    const r = relief(figures, monthly * 12, context)
    const net = monthly - r.monthly
    const today = todayOf(grown, term, context)
    return {
      label: 'Could add to your pension',
      value: euro(grown),
      line: `An extra ${euro(monthly)} a month could cost about ${euro(net)} after tax relief at ${reliefRate}% (USC and PRSI still apply). ${r.sentence}. You already pay in ${euro(paidAlready)} a year, so up to ${euro(r.room)} a year more gets relief. The extra rises with pay each year (${percent(context.wage)}), as in your plan.${inflationLine(context)}`,
      rows: [
        ['Extra per month (first year)', euro(monthly)],
        ['Cost to you after tax relief, a month', euro(net)],
        ['Tax relief a month', euro(r.monthly)],
        ["Worth in today's money", today == null ? NO_INFLATION : euro(today)],
      ],
      goal: {
        kind: 'pension',
        name: 'Raise my pension contribution',
        emoji: '🌅',
        amount: monthly,
      },
      numbers: {
        Grows_To: grown,
        Value_Today: today ?? NO_INFLATION,
        Extra_Per_Month: monthly,
        Net_Cost_Per_Month: net,
        Relief_Limit_Year: r.limit,
        Relieved_Year: r.relievedYearly,
        Relief_Per_Month: r.monthly,
        Plan_Goal_Contribution: monthly,
      },
    }
  },

  avc(figures, context) {
    const { m: monthly, g: growthPercent, y: term, ex: paidAlready } = figures
    const grown = grownSaving(monthly, growthPercent, term)
    const r = relief(figures, monthly * 12, context)
    const netMonthly = monthly - r.monthly
    const today = todayOf(grown, term, context)
    return {
      label: 'Could add',
      value: euro(grown),
      line: `Each ${euro(monthly)} AVC could cost about ${euro(netMonthly)} after tax relief. ${r.sentence} for your main scheme and AVCs together. You already pay in ${euro(paidAlready)} a year, so up to ${euro(r.room)} a year more gets relief.${inflationLine(context)}`,
      rows: [
        ['Paid in', euro(monthly * 12 * term)],
        ['Net cost to you', euro(netMonthly * 12 * term)],
        ['Tax relief a month', euro(r.monthly)],
        ["Worth in today's money", today == null ? NO_INFLATION : euro(today)],
      ],
      goal: {
        kind: 'pension',
        name: 'Raise my pension contribution (AVC)',
        emoji: '🌅',
        amount: monthly,
      },
      numbers: {
        Grows_To: grown,
        Value_Today: today ?? NO_INFLATION,
        Paid_In: monthly * 12 * term,
        Net_Cost: netMonthly * 12 * term,
        Net_Cost_Per_Month: netMonthly,
        Relief_Limit_Year: r.limit,
        Relieved_Year: r.relievedYearly,
        Relief_Per_Month: r.monthly,
        Plan_Goal_Contribution: monthly,
      },
    }
  },

  lastmoney(figures, context) {
    const { pot, w: withdrawal, g: growthPercent, age } = figures
    const { inflation, planEnd, rules } = context
    const end = atYearEnd(context)
    const lasting =
      inflation == null ? null : yearsLasting(pot, withdrawal, growthPercent, inflation * 100, end)
    const toAge = lasting == null ? null : age + lasting
    let outcome = '. Choose your inflation rate to see how long it lasts.'
    if (lasting != null) {
      const until =
        lasting >= MAX_YEARS
          ? `money lasts beyond age ${planEnd}, your plan-until age.`
          : lasting < 1
            ? 'your savings would run out in the first year.'
            : `money lasts to about age ${toAge}` +
              (toAge! < planEnd
                ? `, before the end of your plan (${planEnd}).`
                : toAge! > planEnd
                  ? `, beyond the end of your plan (${planEnd}).`
                  : '.')
      outcome = `, rising with prices (${inflationText(inflation!)}): ${until}`
    }
    const early =
      age < rules.pen.earliestAge
        ? ` Most pensions can't be taken before ${rules.pen.earliestAge} (PRSA and personal pensions; occupational schemes from 50 only if you have left that job).`
        : ''
    const arf = LAW_TEXT.arf.charAt(0).toUpperCase() + LAW_TEXT.arf.slice(1)
    const lastsTo =
      lasting == null
        ? NO_INFLATION
        : lasting >= MAX_YEARS
          ? `Beyond ${planEnd}`
          : lasting < 1
            ? 'Less than a year'
            : toAge!
    return {
      label: 'Could last about',
      value: lastingText(lasting),
      line: `Withdrawing ${euro(withdrawal)} at the ${end ? 'end' : 'start'} of each year${outcome}${early} Before tax: ARF and vested PRSA withdrawals pay income tax and USC (and PRSI before 66). ${arf}. An illustration, not a guarantee.`,
      rows: [
        [
          'Money lasts to about age',
          lasting == null
            ? NO_INFLATION
            : lasting >= MAX_YEARS
              ? `Beyond ${planEnd} (your plan-until age)`
              : lasting < 1
                ? 'Less than a year after you start'
                : String(toAge),
        ],
        ['Withdrawal rate (first year)', ((withdrawal / pot) * 100).toFixed(1) + '%'],
      ],
      goal: null,
      numbers: {
        Years_Lasting: lasting ?? NO_INFLATION,
        Lasts_To_Age: lastsTo,
        Withdrawal_Rate: withdrawal / pot,
      },
    }
  },

  drawdown({ pot, w: withdrawal }, context) {
    const { inflation } = context
    const end = atYearEnd(context)
    const growths = [1, 2, 3].map((style) => Number(context.assumption('riskMu' + style)) * 100)
    const lasting = growths.map((growth) =>
      inflation == null ? null : yearsLasting(pot, withdrawal, growth, inflation * 100, end),
    )
    const prices =
      inflation == null
        ? '. Choose your inflation rate to see them.'
        : `, rising with prices (${inflationText(inflation)}).`
    return {
      label: 'Balanced scenario lasts',
      value: lastingText(lasting[1]),
      line: `Three illustrative growth scenarios (your assumptions); withdrawals at the ${end ? 'end' : 'start'} of each year${prices} Real returns vary year to year. Before tax.`,
      rows: ['Cautious', 'Balanced', 'Growth'].map((name, i) => [
        `${name} (${percent(growths[i] / 100)})`,
        lastingText(lasting[i]),
      ]),
      goal: null,
      numbers: {
        Years_Cautious: lasting[0] ?? NO_INFLATION,
        Years_Balanced: lasting[1] ?? NO_INFLATION,
        Years_Growth: lasting[2] ?? NO_INFLATION,
      },
    }
  },
}
