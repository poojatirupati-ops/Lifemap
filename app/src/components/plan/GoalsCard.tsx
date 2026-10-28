import { fundingOrder } from '../../domain/planning/fund.ts'
import GoalStatus from './GoalStatus.tsx'
import { savingLine } from './saving.ts'
import type { useProjection } from './useProjection.ts'

/** Your goals: how much of each your income and savings cover, in funding order once ranked. */
export default function GoalsCard(props: ReturnType<typeof useProjection>) {
  const { goals, rank } = props.plan
  const ordered = rank ? fundingOrder(goals, rank) : goals.toSorted((a, b) => a.age - b.age)
  const { spareMonthly, savingMonthly } = props.withWhatIf.saving
  const line = savingLine(spareMonthly, savingMonthly)

  return (
    <div className="card">
      <h3 className="h">Your goals</h3>
      <p className="small" style={{ margin: '0 0 6px' }}>
        How much of each goal your future income and savings can cover.
      </p>
      <div id="r-goals">
        {line && (
          <p className="small" style={{ margin: '0 0 10px' }}>
            {line}
          </p>
        )}
        {ordered.map((goal) => (
          <GoalStatus key={goal.id} {...props} goal={goal} />
        ))}
      </div>
    </div>
  )
}
