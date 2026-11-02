import type { YearRow } from '../../../domain/planning/project.ts'
import { yearSplit } from './cashflow.ts'
import MiniLine from './MiniLine.tsx'

/** The chosen year's income, spending and how it was paid, read out when it changes. */
export default function YearDetail({ row, retiring }: { row: YearRow; retiring: boolean }) {
  const split = yearSplit(row)
  const goals = row.goalsDue.map((goal) => `${goal.e} ${goal.name}`).join(', ')
  const heading = `Age ${row.age} (${row.year})${retiring ? ' · retirement starts' : ''}`
  return (
    <div className="cdet" id="r-cdet" aria-live="polite">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <b style={{ fontSize: 15 }}>{heading}</b>
        <span className="small">Tap a bar or use ← →</span>
      </div>
      <MiniLine label="Income" amount={row.inflow} />
      <MiniLine label="Spending" amount={split.spending} />
      <div className="csub">
        <MiniLine label="Living costs" amount={row.living} />
        <MiniLine label="Loans & mortgage" amount={row.repayments} />
        {row.goalCost > 0.5 ? <MiniLine label={`Goals: ${goals}`} amount={row.goalCost} /> : null}
      </div>
      <MiniLine label="Paid from income" amount={split.fromIncome} colour="var(--good)" />
      <MiniLine label="Paid from savings" amount={split.fromSavings} colour="var(--nudge)" />
      <MiniLine label="Shortfall" amount={split.shortfall} colour="var(--alert)" />
      <MiniLine label="Savings left at year end" amount={row.liquid} />
    </div>
  )
}
