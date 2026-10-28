import type { ReactNode } from 'react'
import GIcon from '../ui/GIcon.tsx'

interface Props {
  emoji: string
  title: string
  detail: ReactNode
  /** the original's data-a / data-p, kept for the equality tools */
  action: string
  page?: string
  right?: ReactNode
  onClick: () => void
}

/** A row in the Me tab's lists: icon, title, one line of detail and a chevron. */
export default function MeRow({ emoji, title, detail, action, page = '', right, onClick }: Props) {
  return (
    <button className="goal" data-a={action} data-p={page} onClick={onClick}>
      <GIcon emoji={emoji} className="ic" aria-hidden="true" />
      <span style={{ flex: 1, minWidth: 0 }}>
        <b>{title}</b>
        <br />
        <span className="small">{detail}</span>
      </span>
      {right ?? (
        <span className="chev" aria-hidden="true">
          ›
        </span>
      )}
    </button>
  )
}
