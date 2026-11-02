import type { ReactNode } from 'react'
import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'

type Props = {
  emoji: string
  title: string
  detail: ReactNode
  right?: ReactNode
} & ({ page: string } | { action: string; onClick: () => void })

/** A row in the Me tab's lists: icon, title, one line of detail and a chevron; `page` opens that Me page. */
export default function MeRow({ emoji, title, detail, right, ...target }: Props) {
  const openMe = useStore((store) => store.openMe)
  const [action, page, onClick] =
    'page' in target
      ? ['me', target.page, () => openMe(target.page)]
      : [target.action, '', target.onClick]

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
