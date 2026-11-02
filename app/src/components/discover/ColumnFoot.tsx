import type { ReactNode } from 'react'

const style = { flexDirection: 'column', alignItems: 'stretch', gap: 6 } as const

/** The quiz foot with its buttons stacked full width. */
export default function ColumnFoot({ children }: { children: ReactNode }) {
  return (
    <div className="qfoot" style={style}>
      {children}
    </div>
  )
}
