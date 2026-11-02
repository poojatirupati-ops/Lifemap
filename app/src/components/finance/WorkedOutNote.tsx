import { useMemo, type CSSProperties } from 'react'
import { workedOutNote } from './checkList.ts'
import { useFinancePlan } from '../../hooks/useCheckPlan.ts'

type Props = { field: string; style?: CSSProperties }

// the repayments the plan can work out when the one given would not clear the debt
const REPAYMENTS = new Set(['mortPayM', 'cardPayM', 'loanPayM'])

function Note({ field, style }: Props) {
  const plan = useFinancePlan()
  const note = useMemo(() => workedOutNote(field, plan), [field, plan])
  return note ? (
    <span
      className="small"
      id={`wo-${field}`}
      style={{ display: 'block', ...style, color: 'var(--sea-d)' }}
    >
      {note}
    </span>
  ) : null
}

/** "We worked out a repayment…" under a repayment, when the plan works one out. */
export default function WorkedOutNote({ field, style }: { field?: string; style?: CSSProperties }) {
  return field && REPAYMENTS.has(field) ? <Note field={field} style={style} /> : null
}
