import { euro } from '../../lib/format.ts'

/** An investment falling from one amount to another, above the answers. */
export default function ScenarioPanel({ from, to }: { from: number; to: number }) {
  return (
    <div className="panel">
      <div className="scn">
        <div>
          <small>You put in</small>
          <b>{euro(from)}</b>
        </div>
        <div style={{ textAlign: 'right' }}>
          <small>A month later</small>
          <b style={{ color: 'var(--gap-t)' }}>{euro(to)}</b>
        </div>
      </div>
      <div className="pbar" style={{ marginTop: 10 }}>
        <i style={{ width: `${(to / from) * 100}%`, background: 'var(--sun)' }} />
      </div>
    </div>
  )
}
