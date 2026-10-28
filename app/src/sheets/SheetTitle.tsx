import type { CSSProperties, ReactNode } from 'react'

/** A sheet's heading: it names the dialog and takes focus when nothing else should. */
export default function SheetTitle({
  style,
  children,
}: {
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <h2 className="t" id="sheet-t" tabIndex={-1} style={style}>
      {children}
    </h2>
  )
}
