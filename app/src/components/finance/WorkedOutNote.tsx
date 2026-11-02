import type { CSSProperties } from 'react'
import { useStore } from '../../state/store.ts'
import { workedOutNote } from './checkList.ts'

// the repayments the plan can work out when the one given would not clear the debt
const REPAYMENTS = new Set(['mortPayM', 'cardPayM', 'loanPayM'])

/** "We worked out a repayment…" under a repayment, when the plan works one out. */
export default function WorkedOutNote({ field, style }: { field?: string; style?: CSSProperties }) {
  const note = useStore(({ plan }) =>
    field && REPAYMENTS.has(field) ? workedOutNote(field, plan) : '',
  )
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
