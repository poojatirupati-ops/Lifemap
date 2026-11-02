import type { CSSProperties } from 'react'
import GIcon from '../ui/GIcon.tsx'

interface Props {
  emoji: string
  title: string
  sub: string
  iconStyle?: CSSProperties
  onClick: () => void
  /** The original's data-a / data-p, kept so the markup matches. */
  [data: `data-${string}`]: string | number
}

/** A list row in Explore: icon, title, one line under it and a chevron. */
export default function ExploreRow({ emoji, title, sub, iconStyle, onClick, ...data }: Props) {
  return (
    <button className="goal" onClick={onClick} {...data}>
      <GIcon className="ic" emoji={emoji} style={iconStyle} aria-hidden="true" />
      <span style={{ flex: 1 }}>
        <b>{title}</b>
        <br />
        <span className="small">{sub}</span>
      </span>
      <span className="chev" aria-hidden="true">
        ›
      </span>
    </button>
  )
}
