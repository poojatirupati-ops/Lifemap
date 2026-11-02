import type { CSSProperties } from 'react'
import type { Cushion } from '../../domain/discovery/riskMismatch.ts'
import type { RiskRead } from '../../domain/discovery/riskRead.ts'

const figure: CSSProperties = { display: 'block', fontSize: 19, marginTop: 4 }
const termTag: CSSProperties = { color: 'var(--storm-t)', fontWeight: 800 }

interface Props {
  read: Pick<RiskRead, 'comfort' | 'cushion'>
  cushion: Cushion
  /** the customer's own terms for the road and the surprise answers */
  appetiteTerm: string | null
  surpriseTerm: string | null
}

/** Risk appetite and cushion, in words and in terms. */
export default function RiskStats({ read, cushion, appetiteTerm, surpriseTerm }: Props) {
  return (
    <div className="grid2 drstats">
      <div className="panel" style={{ margin: 0 }}>
        <span className="drsic" aria-hidden="true">
          🌦️
        </span>
        <span className="small">
          <b>Risk appetite</b>
          <br />
          how much risk you want
        </span>
        <b style={figure}>{read.comfort || '—'}</b>
        {appetiteTerm && appetiteTerm !== read.comfort ? (
          <span className="small" style={termTag}>
            ◆ {appetiteTerm}
          </span>
        ) : null}
      </div>
      <div className="panel" style={{ margin: 0 }}>
        <span className="drsic pe" aria-hidden="true">
          🛟
        </span>
        <span className="small">
          <b>Cushion</b>
          <br />
          money for surprises
        </span>
        <b style={figure}>{read.cushion || '—'}</b>
        {cushion.hasFigures ? (
          <span className="small" style={{ display: 'block' }}>
            {cushion.months} of {cushion.targetMonths} months (your figures)
          </span>
        ) : null}
        {surpriseTerm ? (
          <span className="small" style={termTag}>
            ◆ {surpriseTerm}
            {cushion.hasFigures ? '' : ' (your answer)'}
          </span>
        ) : null}
      </div>
    </div>
  )
}
