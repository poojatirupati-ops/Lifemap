import type { YearRow } from '../../../domain/planning/project.ts'
import { euro } from '../../../lib/format.ts'
import Emo from '../../ui/Emo.tsx'
import { yearSplit } from './cashflow.ts'

type Line = [label: string, amount: number, colour?: string]

const lines = (items: Line[]) =>
  items.map(([label, amount, colour]) => (
    <div className="mini" key={label}>
      <span>
        {colour && <i className="sw" style={{ background: colour, marginRight: 6 }} />}
        <Emo>{label}</Emo>
      </span>
      <b>{euro(amount)}</b>
    </div>
  ))

/** The chosen year's income, spending and how it was paid, read out when it changes. */
export default function YearDetail({ row, retiring }: { row: YearRow; retiring: boolean }) {
  const split = yearSplit(row)
  const goals = row.goalsDue.map((goal) => `${goal.e} ${goal.name}`).join(', ')
  return (
    <div className="cdet" id="r-cdet" aria-live="polite">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <b style={{ fontSize: 15 }}>
          {`Age ${row.age} (${row.year})${retiring ? ' · retirement starts' : ''}`}
        </b>
        <span className="small">Tap a bar or use ← →</span>
      </div>
      {lines([
        ['Income', row.inflow],
        ['Spending', split.spending],
      ])}
      <div className="csub">
        {lines([
          ['Living costs', row.living],
          ['Loans & mortgage', row.repayments],
          ...(row.goalCost > 0.5 ? [[`Goals: ${goals}`, row.goalCost] as Line] : []),
        ])}
      </div>
      {lines([
        ['Paid from income', split.fromIncome, 'var(--good)'],
        ['Paid from savings', split.fromSavings, 'var(--nudge)'],
        ['Shortfall', split.shortfall, 'var(--alert)'],
        ['Savings left at year end', row.liquid],
      ])}
    </div>
  )
}
