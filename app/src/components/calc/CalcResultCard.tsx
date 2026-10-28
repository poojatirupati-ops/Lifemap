import type { CSSProperties } from 'react'
import { EXAMPLE_LABEL } from './words.ts'
import type { CalcResult } from './types.ts'

const card: CSSProperties = { background: 'var(--ink)', color: '#fff' }
const eyebrow: CSSProperties = { color: 'var(--sun)' }
const rowStyle: CSSProperties = {
  justifyContent: 'space-between',
  borderTop: '1px solid rgba(255,255,255,.14)',
  padding: '8px 0',
  marginTop: 8,
  fontSize: 13.5,
}

/** The live result: headline, the sentence that explains it, and the figures behind it. */
export default function CalcResultCard({
  result,
  example,
}: {
  result: CalcResult
  example: boolean
}) {
  return (
    <div className="card" style={card}>
      <div className="eyebrow" style={eyebrow}>
        {result.label}
      </div>
      <div style={{ fontFamily: 'var(--fh)', fontSize: 36, fontWeight: 800, margin: '4px 0' }}>
        {result.value}
      </div>
      {example && (
        <p
          className="exres"
          style={{ margin: '0 0 6px', fontSize: 12.5, fontWeight: 800, color: 'var(--sun)' }}
        >
          {EXAMPLE_LABEL}
        </p>
      )}
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#DCE7F2' }}>{result.line}</p>
      {result.rows.map(([label, value]) => (
        <div key={label} className="row" style={rowStyle}>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  )
}
