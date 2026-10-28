import type { CSSProperties, ReactNode } from 'react'

/** A horizontal row of cards that scrolls sideways and can be stepped with the arrow keys. */
export default function Strip({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  return (
    <div
      className="hstrip"
      role="group"
      tabIndex={0}
      aria-label="Scrollable list. Use the arrow keys to see more."
      style={style}
    >
      {children}
    </div>
  )
}
