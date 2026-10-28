import type { YearRow } from '../../../domain/planning/project.ts'
import { euro } from '../../../lib/format.ts'
import { isShortYear, yearSplit } from './cashflow.ts'

const years = (count: number) => `${count} ${count === 1 ? 'year' : 'years'}`

const unpaidGoals = (row: YearRow) =>
  row.goalsDue.filter((goal) => goal.paid < goal.cost - 1).map((goal) => goal.name)

/** The chart in words: every year covered, or where the gaps are and how big. */
export default function ChartSummary({ rows }: { rows: YearRow[] }) {
  const short = rows.filter(isShortYear)
  if (!short.length) {
    const usingSavings = rows.filter((row) => yearSplit(row).fromSavings > 0.5).length
    const savingsNote = usingSavings
      ? `, and in ${years(usingSavings)} you use savings, which is what they are for`
      : ''
    return (
      <p className="pnote">
        <b>In plain English:</b>
        {` every year is covered by your income and savings${savingsNote}. No coral on the chart.`}
      </p>
    )
  }

  const [first] = short
  const firstGoals =
    first.goalGap > 0.5 && first.goalsDue.length
      ? ` (${unpaidGoals(first).join(' and ').toLowerCase()})`
      : ''
  const total = short.reduce((sum, row) => sum + row.shortfall, 0)
  const goals = [...new Set(short.flatMap(unpaidGoals))]
  const livingShort = short.filter((row) => row.livingShortfall > 0.5)
  return (
    <p className="pnote">
      <b>In plain English:</b> the first shortfall is at <b>age {first.age}</b>, about{' '}
      <b>{euro(first.shortfall)}</b>
      {`${firstGoals}. Across your plan there ${short.length > 1 ? `are ${short.length} years` : 'is 1 year'} with a gap, about ${euro(total)} in total`}
      {goals.length ? `. Goals involved: ${goals.join(', ').toLowerCase()}` : ''}
      {livingShort.length
        ? `. Everyday costs run short in ${years(livingShort.length)}, from age ${livingShort[0].age}`
        : ''}
      . Saving more, changing timing or rethinking a goal closes it.
    </p>
  )
}
