// Savings & Goals and Investments: goal planner, compound growth, lump sum, real return, regular
// investing, fees, risk and return.
import { euro, percent } from '../../lib/format.ts'
import { clamp } from '../../lib/clamp.ts'
import { grownLump, grownSaving, monthlyFromYearly } from './maths.ts'
import type { CalcContext, Calculator } from './types.ts'
import {
  adjustNeedsInflation,
  beforeTax,
  inflationLine,
  inTodaysMoney,
  NO_INFLATION,
  NO_INFLATION_GOAL,
  realReturnLine,
  worthToday,
  years,
} from './words.ts'

const WAIT_YEARS = 5
const ONE_IN_20 = 1.645 // the standard-normal value for a 1-in-20 year
const STYLES = ['Cautious', 'Balanced', 'Growth']

/** Growth after a yearly fee taken off the grown value. */
const afterFees = (growthPercent: number, feePercent: number) =>
  (1 + growthPercent / 100) * (1 - feePercent / 100) - 1

const growGoal = (today: number | null, term: number) =>
  today == null
    ? { kind: 'blocked', message: NO_INFLATION_GOAL }
    : { kind: 'pot', name: 'Grow my wealth', emoji: '📈', amount: Math.round(today), years: term }

/** The headline in today's money when the switch is on, and the real return. */
function todaysMoney(future: number, term: number, growth: number, context: CalcContext) {
  const { inflation, adjustForInflation } = context
  const today = inflation == null ? null : inTodaysMoney(future, term, inflation)
  const realReturn = inflation == null ? NO_INFLATION : (1 + growth) / (1 + inflation) - 1
  return { today, realReturn, adjusted: adjustForInflation }
}

/** The "Worth in today's money" row, shown while the switch is on. */
const todayRow = (adjusted: boolean, today: number | null): [string, string][] =>
  adjusted ? [["Worth in today's money", today == null ? NO_INFLATION : euro(today)]] : []

export const INVEST: Record<string, Calculator['run']> = {
  goalplanner({ t: target, y: term, s: saved, r: rate }, context) {
    const { inflation } = context
    const known = inflation != null
    const future = known ? target * (1 + inflation) ** term : null
    const grown = saved * (1 + rate / 100) ** term
    const still = known ? Math.max(0, future! - grown) : null
    const monthlyRate = monthlyFromYearly(rate)
    const count = term * 12
    const monthly = !known
      ? null
      : still! <= 0
        ? 0
        : monthlyRate
          ? (still! * monthlyRate) / ((1 + monthlyRate) ** count - 1)
          : still! / count
    const show = (amount: number | null) => (known ? euro(amount!) : NO_INFLATION)
    const line = known
      ? `Your goal will cost about ${euro(future!)} in ${years(term)}. Setting aside about ${euro(monthly!)} a month could reach it.${inflationLine(context)}`
      : 'Choose your inflation rate to see what your goal will cost by then and the monthly amount.'
    return {
      label: 'Monthly amount to save',
      value: show(monthly),
      line: `${line} ${beforeTax(context.rules)}`,
      rows: [
        ["Goal in today's prices", euro(target)],
        [`Will cost about (in ${years(term)})`, show(future)],
        ['Your savings grow to', euro(grown)],
        ['Still needed at the goal year', show(still)],
      ],
      goal: { kind: 'spend', name: 'My goal', emoji: '🎯', amount: target, saved, years: term },
      numbers: {
        Monthly_Saving: monthly ?? NO_INFLATION,
        Future_Cost: future ?? NO_INFLATION,
        Saved_Grows_To: grown,
        Still_Needed: still ?? NO_INFLATION,
        Plan_Goal_Amount: target,
        Plan_Goal_Saved: saved,
        Plan_Goal_Years: term,
      },
    }
  },

  compound({ p: start, m: monthly, r: rate, y: term }, context) {
    const monthlyRate = monthlyFromYearly(rate)
    const count = term * 12
    const grown =
      start * (1 + monthlyRate) ** count +
      (monthlyRate ? (monthly * ((1 + monthlyRate) ** count - 1)) / monthlyRate : monthly * count)
    const paidIn = start + monthly * 12 * term
    const { inflation } = context
    const today = inflation == null ? null : inTodaysMoney(grown, term, inflation)
    return {
      label: 'Could grow to',
      value: euro(grown),
      line: `You would put in ${euro(paidIn)}. Growth could add about ${euro(grown - paidIn)} (illustrative, not guaranteed). ${worthToday(grown, term, context)}${inflationLine(context)} ${beforeTax(context.rules)}`,
      rows: [
        ['Paid in', euro(paidIn)],
        ['Illustrative growth', euro(grown - paidIn)],
        ...todayRow(true, today),
      ],
      goal: growGoal(today, term),
      numbers: {
        Grows_To: grown,
        Value_Today: today ?? NO_INFLATION,
        Paid_In: paidIn,
        Growth_Earned: grown - paidIn,
        Plan_Goal_Amount: today == null ? NO_INFLATION_GOAL : Math.round(today),
      },
    }
  },

  lumpsum(figures, context) {
    const { p: amount, r: ratePercent, y: term, f: fee = 0 } = figures
    const growth = afterFees(ratePercent, fee)
    const gross = grownLump(amount, ratePercent, term)
    const grown = amount * (1 + growth) ** term
    const wait = figures.wait ?? WAIT_YEARS
    const late =
      amount * (1 + context.cash) ** Math.min(wait, term) * (1 + growth) ** Math.max(0, term - wait)
    const { today, realReturn, adjusted } = todaysMoney(grown, term, growth, context)
    const known = today != null
    const discount = known ? grown / today : 1
    const headline = adjusted ? (known ? today : NO_INFLATION) : grown
    const waitCost = adjusted ? (known ? (grown - late) / discount : NO_INFLATION) : grown - late
    const feesNote = fee ? ' (after fees)' : ''
    const opening =
      adjusted && known
        ? realReturnLine(growth * 100, 'growth' + (fee ? ' after fees' : ''), context.inflation!)
        : adjustNeedsInflation(context)
    const waiting =
      typeof waitCost !== 'number'
        ? ''
        : waitCost > 0
          ? `Waiting ${years(wait)} before starting could mean about ${euro(waitCost)} less, which is the cost of waiting. `
          : `With growth of ${(growth * 100).toFixed(2)}% a year after fees, no more than the cash rate, waiting ${years(wait)} costs nothing here. `
    return {
      label: (adjusted ? "In today's money" : 'Could grow to') + feesNote,
      value: typeof headline === 'number' ? euro(headline) : headline,
      line: `${opening}While it waits, the money earns the cash savings rate (${percent(context.cash)} a year, before DIRT). ${waiting}${beforeTax(context.rules)}`,
      rows: [
        ['If you start today (after fees)', euro(grown)],
        [`If you start in ${years(wait)}`, euro(late)],
        ...todayRow(adjusted, today),
        ...(fee ? [['Fees cost', euro(gross - grown)] as [string, string]] : []),
      ],
      goal: growGoal(today, term),
      numbers: {
        Headline: headline,
        Grows_To: grown,
        Value_Start_Later: late,
        Value_Today: today ?? NO_INFLATION,
        Cost_Of_Waiting: waitCost,
        Fees_Cost: gross - grown,
        Growth_After_Fees: growth,
        Real_Return: realReturn,
        Plan_Goal_Amount: known ? Math.round(today) : NO_INFLATION_GOAL,
      },
    }
  },

  realreturn({ p: amount, r: rate, y: term }, context) {
    const future = grownLump(amount, rate, term)
    const { inflation } = context
    if (inflation == null) {
      return {
        label: 'Future value',
        value: euro(future),
        line: `Choose your inflation rate to see the real return and what it's worth in today's money. ${beforeTax(context.rules)}`,
        rows: [
          ['Future value', euro(future)],
          ["In today's money", NO_INFLATION],
          ['Real return a year', NO_INFLATION],
        ],
        goal: null,
        numbers: { Future_Value: future, Value_Today: NO_INFLATION, Real_Return: NO_INFLATION },
      }
    }
    const real = (1 + rate / 100) / (1 + inflation) - 1 // exact, not growth minus inflation
    const today = inTodaysMoney(future, term, inflation)
    return {
      label: "In today's money",
      value: euro(today),
      line: `A ${+rate.toFixed(2)}% return with prices rising ${percent(inflation)} is really about ${(real * 100).toFixed(1)}% a year. ${beforeTax(context.rules)}`,
      rows: [
        ['Future value', euro(future)],
        ['Real return a year', +(real * 100).toFixed(2) + '%'],
        ["Value in today's money", euro(today)],
      ],
      goal: null,
      numbers: { Future_Value: future, Value_Today: today, Real_Return: real },
    }
  },

  regularinvest({ m: monthly, y: term, g: rate, f: fee }, context) {
    const growth = afterFees(rate, fee)
    const gross = grownSaving(monthly, rate, term)
    const net = grownSaving(monthly, growth * 100, term)
    const { today, realReturn, adjusted } = todaysMoney(net, term, growth, context)
    const known = today != null
    const headline = adjusted ? (known ? today : NO_INFLATION) : net
    const opening =
      adjusted && known
        ? realReturnLine(growth * 100, 'growth after fees', context.inflation!)
        : adjustNeedsInflation(context)
    return {
      label: adjusted ? "In today's money (after fees)" : 'Could grow to (after fees)',
      value: typeof headline === 'number' ? euro(headline) : headline,
      line: `${opening}Fees of ${fee}% a year could cost about ${euro(gross - net)} over ${years(term)}. ${beforeTax(context.rules)}`,
      rows: [
        ['Paid in', euro(monthly * 12 * term)],
        ['Before fees', euro(gross)],
        ['Fees cost', euro(gross - net)],
        ...todayRow(adjusted, today),
      ],
      goal: growGoal(today, term),
      numbers: {
        Headline: headline,
        Value_After_Fees: net,
        Value_Before_Fees: gross,
        Fees_Cost: gross - net,
        Paid_In: monthly * 12 * term,
        Value_Today: today ?? NO_INFLATION,
        Growth_After_Fees: growth,
        Real_Return: realReturn,
        Plan_Goal_Amount: known ? Math.round(today) : NO_INFLATION_GOAL,
      },
    }
  },

  fees({ p: amount, y: term, g: rate, a: feeA, b: feeB }) {
    const withFee = (fee: number) => amount * (1 + afterFees(rate, fee)) ** term
    const valueA = withFee(feeA)
    const valueB = withFee(feeB)
    const difference = Math.abs(valueA - valueB)
    return {
      label: 'Difference',
      value: euro(difference),
      line: `A ${Math.abs(feeB - feeA).toFixed(2)}% difference in yearly fees could change the outcome by about ${euro(difference)}. Before tax.`,
      rows: [
        [`With ${feeA}% fees`, euro(valueA)],
        [`With ${feeB}% fees`, euro(valueB)],
      ],
      goal: null,
      numbers: {
        Difference: difference,
        Value_With_Fee_A: valueA,
        Value_With_Fee_B: valueB,
        Fee_Gap: Math.abs(feeB - feeA) / 100,
      },
    }
  },

  riskreturn({ p: amount, y: term, s }, context) {
    const style = clamp(Math.round(s), 1, 3)
    const growth = Number(context.assumption('riskMu' + style))
    const volatility = Number(context.assumption('riskVol' + style))
    const spread = volatility / Math.sqrt(term)
    const middle = amount * (1 + growth) ** term
    const weaker = amount * (1 + growth - spread) ** term
    const stronger = amount * (1 + growth + spread) ** term
    const fall = Math.round((volatility * ONE_IN_20 - growth) * 100) / 100
    const name = STYLES[style - 1]
    const badYear =
      Math.round(fall * 100) >= 1
        ? `About a 1-in-20 bad year could see a fall of around ${Math.round(fall * 100)}%.`
        : 'On these assumptions a 1-in-20 bad year is not expected to bring a fall.'
    return {
      label: `${name} · middle outcome`,
      value: euro(middle),
      line: `Illustrative only. ${badYear} Over longer timeframes the yearly return range narrows, but the gap in euros between the weaker and stronger outcomes widens; "weaker" is roughly a 1-in-6 chance of doing worse, not the worst case.`,
      rows: [
        ['Weaker outcome', euro(weaker)],
        ['Middle outcome', euro(middle)],
        ['Stronger outcome', euro(stronger)],
      ],
      goal: null,
      numbers: {
        Middle: middle,
        Weaker: weaker,
        Stronger: stronger,
        Difficult_Year_Fall: fall,
        Style_Name: name,
        Spread: spread,
      },
    }
  },
}
