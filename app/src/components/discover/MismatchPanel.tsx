import { useStore } from '../../state/store.ts'

interface Props {
  message: string
  /** the cushion is not in place: offer an Emergency fund goal */
  offerEmergencyFund: boolean
}

/** At most one hint where what they want and what they can afford pull apart. */
export default function MismatchPanel({ message, offerEmergencyFund }: Props) {
  const hasEmergencyFund = useStore(
    ({ plan }) => !!plan.safetyWanted || plan.goals.some((goal) => goal.key === 'safety'),
  )
  const wantEmergencyFund = useStore((store) => store.wantEmergencyFund)
  return (
    <div className="panel">
      <div className="qeye" style={{ color: 'var(--sea-d)' }}>
        You might notice…
      </div>
      <p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.5 }}>{message}</p>
      {offerEmergencyFund ? (
        hasEmergencyFund ? (
          <p className="small" style={{ margin: '8px 0 0', fontWeight: 700 }}>
            ✓ An Emergency fund is in your goals. It's optional: you can remove it in My Plan.
          </p>
        ) : (
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={wantEmergencyFund}>
            Add an Emergency fund goal
          </button>
        )
      ) : null}
    </div>
  )
}
