import type { ButtonHTMLAttributes } from 'react'
import './ui.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }

export default function Chip({ selected = false, type = 'button', ...rest }: Props) {
  return <button type={type} aria-pressed={selected} className="ui-chip" {...rest} />
}
