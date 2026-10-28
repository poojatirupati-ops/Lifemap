import type { CSSProperties } from 'react'
import { closeSheet } from '../hooks/useFocusReturn.ts'

/** The plain "Got it" / "Close" / "Not now" button at the foot of a sheet. */
export default function CloseButton({
  ghost,
  style,
  children,
}: {
  ghost?: boolean
  style?: CSSProperties
  children: string
}) {
  return (
    <button className={ghost ? 'btn ghost' : 'btn'} style={style} onClick={closeSheet}>
      {children}
    </button>
  )
}
