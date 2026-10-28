import { missingText } from './values.ts'

/** No result until the customer's own figures and choices are in: what to add first, and what else. */
export default function CalcGate({ missing }: { missing: string[] }) {
  const [first, ...rest] = missing
  return (
    <div className="card" id="cgate" style={{ background: 'var(--ink)', color: '#fff' }}>
      <div className="eyebrow" style={{ color: 'var(--sun)' }}>
        Your result
      </div>
      <b style={{ fontSize: 18, display: 'block', margin: '4px 0' }}>
        {missingText(first)} to see this
      </b>
      {rest.length > 0 && (
        <p style={{ margin: 0, fontSize: 13.5, color: '#DCE7F2' }}>
          Also still to add or choose: {rest.map((name) => name.replace(/^add:/, '')).join(', ')}.
        </p>
      )}
    </div>
  )
}
