import type { ReactNode } from 'react'

/** A statement line that is shown, not edited: its label, a tag under it, and its value. */
export default function StatementTextRow({
  label,
  tag,
  value,
}: {
  label: string
  tag: ReactNode
  value: string
}) {
  return (
    <div className="mini">
      <span>
        <b style={{ fontSize: 14 }}>{label}</b>
        <br />
        {tag}
      </span>
      <b>{value}</b>
    </div>
  )
}
