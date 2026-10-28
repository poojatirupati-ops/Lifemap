import type { ReactNode } from 'react'

/** A collapsible card of settings, closed to start with. */
export default function StandardGroup({
  name,
  title,
  children,
}: {
  name: string
  title: string
  children: ReactNode
}) {
  return (
    <details className="card asmg" data-g={name}>
      <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>{title}</summary>
      <div style={{ marginTop: 10 }}>{children}</div>
    </details>
  )
}
