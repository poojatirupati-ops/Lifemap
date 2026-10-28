import type { ButtonHTMLAttributes } from 'react'
import './ui.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'link' }

export default function Button({ variant = 'primary', className = '', type = 'button', ...rest }: Props) {
  return <button type={type} className={`ui-btn ui-btn-${variant} ${className}`} {...rest} />
}
