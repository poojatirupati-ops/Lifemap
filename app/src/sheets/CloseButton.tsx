import type { CSSProperties } from 'react'
import { useStore } from '../state/store.ts'

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
  const closeSheet = useStore((store) => store.closeSheet)
  return (
    <button className={ghost ? 'btn ghost' : 'btn'} style={style} onClick={closeSheet}>
      {children}
    </button>
  )
}
