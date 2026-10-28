import type { HTMLAttributes } from 'react'
import './ui.css'

export default function Card({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={`ui-card ${className}`} {...rest} />
}
