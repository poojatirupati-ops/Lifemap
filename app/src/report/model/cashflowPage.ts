// Report page 6: the savings chart and how each year is paid.
import { euro } from '../../lib/format.ts'
import { axisMax, yearSplit } from '../../components/results/chart/cashflow.ts'
import type { ReportContext } from './context.ts'

const ticks = (max: number) => [0, 1, 2, 3, 4].map((step) => Math.round((max / 4) * step))

/** Working, then living on savings, then a gap (or covered), as chart bands. */
function zones({ startAge, endAge, retirement, retireAge, gap }: ReportContext) {
  const stopsWork = retirement ? Math.max(startAge, Math.min(retireAge, endAge)) : startAge
  const runOut = gap.runOut?.age
  const all = []
  if (retirement && stopsWork > startAge)
    all.push({ fromAge: startAge, toAge: stopsWork, label: 'WORKING', tone: 'good' })
  if (runOut == null)
    all.push({
      fromAge: stopsWork,
      toAge: endAge,
      label: retirement ? '' : 'COVERED',
      tone: 'good',
    })
  else {
    if (runOut > stopsWork) all.push({ fromAge: stopsWork, toAge: runOut, label: '', tone: 'gold' })
    all.push({ fromAge: Math.max(startAge, runOut), toAge: endAge, label: 'A GAP', tone: 'coral' })
  }
  return all.filter((zone) => zone.toAge > zone.fromAge)
}

export function cashflowPage(context: ReportContext) {
  const { rows, startAge, endAge, retirement, retired, retireAge, gap } = context
  const runOut = gap.runOut?.age
  const peak = rows.reduce((best, row) => (row.liquid > best.liquid ? row : best), rows[0])
  const peakAmount = Math.round(peak.liquid)
  const savingsMax = axisMax(Math.max(1, peak.liquid * 1.1))
  const paid = rows.map((row) => ({ age: row.age, ...yearSplit(row) }))
  const paidMax = axisMax(Math.max(1, ...paid.map((year) => year.spending)) * 1.1)
  const lastShortfall = Math.round(paid[paid.length - 1].shortfall)
  const bands = zones(context)
  return {
    big: euro(peakAmount),
    bigLabel: `savings at the peak, age ${peak.age}`,
    bigTone: runOut == null ? 'good' : 'coral',
    eyebrow: 'CASHFLOW',
    title: runOut == null ? `Your savings last to ${endAge}` : `Your savings run out at ${runOut}`,
    savingsChart: {
      title: `Your savings, age ${startAge} to ${endAge}`,
      subtitle: 'Cash and investments',
      yMax: savingsMax,
      yTicks: ticks(savingsMax),
      series: rows.map((row) => ({ age: row.age, value: Math.round(row.liquid) })),
      peak:
        peakAmount > 0
          ? {
              age: peak.age,
              value: peakAmount,
              label: `Peak ${euro(peakAmount)}`,
              sub: `at age ${peak.age}`,
            }
          : null,
      runOut: runOut == null ? null : { age: runOut, label: `Savings run out at ${runOut}` },
      zones: bands,
      caption:
        `Savings reach ${euro(peak.liquid)} at ${peak.age}.` +
        (runOut == null ? ` Savings last to ${endAge}.` : ` Savings run out at ${runOut}.`),
    },
    paidChart: {
      title: 'How each year is paid',
      legend: [
        { tone: 'good', label: 'Paid from income' },
        { tone: 'gold', label: 'Paid from savings' },
        { tone: 'coral', label: 'Shortfall, not covered' },
      ],
      yMax: paidMax,
      yTicks: ticks(paidMax),
      bars: paid.map((year) => ({
        age: year.age,
        fromIncome: Math.round(year.fromIncome),
        fromSavings: Math.round(year.fromSavings),
        shortfall: Math.round(year.shortfall),
      })),
      zones: bands,
      stopMarker:
        retirement && !retired && retireAge > startAge && retireAge <= endAge
          ? { age: retireAge, label: `Pay stops at ${retireAge}` }
          : null,
      lastLabel:
        lastShortfall > 0
          ? {
              age: paid[paid.length - 1].age,
              label: `${euro(lastShortfall)} a year at ${paid[paid.length - 1].age}`,
            }
          : null,
      caption: (retirement ? `Pay stops at ${retireAge}. ` : '') + 'Costs keep rising.',
    },
  }
}
