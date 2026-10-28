import { useStore } from '../../state/store.ts'
import { essentialSpending } from '../../domain/goals/goals.ts'
import { cushion } from '../../domain/discovery/cushion.ts'
import { euro } from '../../lib/format.ts'
import type { Goal } from '../../state/types.ts'

/** How many months of essential spending the emergency fund covers, and why it was added. */
export default function SafetyNote({ goal }: { goal: Goal }) {
  const plan = useStore((store) => store.plan)
  const spending = essentialSpending(plan)
  if (!(spending > 0) || !(goal.amount > 0)) return null

  const months = Math.round((goal.amount / spending) * 10) / 10
  const { months: covered, targetMonths } = cushion(plan)
  const why = goal.autoAdded
    ? `Added because your cash covers ${covered} of ${targetMonths} months. An emergency fund comes before other goals. You can remove it. `
    : ''
  return (
    <span className="small" style={{ display: 'block' }} id={`sf-note-${goal.id}`}>
      {`${why}${euro(goal.amount)} is about ${months} ${months === 1 ? 'month' : 'months'} of your essential spending (${euro(spending)} a month).`}
    </span>
  )
}
