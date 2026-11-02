import type { ReactNode } from 'react'

/** A section heading row (.sec): its h3, then anything on the right (a count, a See link). */
export default function Sec({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="sec">
      <h3>{title}</h3>
      {children}
    </div>
  )
}
