import type { CSSProperties } from 'react'
import { COLOURS } from './tones.ts'

export default function Logo({ style }: { style?: CSSProperties }) {
  return (
    <span className="lmr-logo" style={style}>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill={COLOURS.teal} />
        <path
          d="M8.2 16.4 14.6 7.8"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="14.9" cy="7.5" r="1.4" fill="#fff" />
      </svg>
      <b>LifeMap</b>
    </span>
  )
}
