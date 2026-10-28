import type { ReactNode } from 'react'
import './ui.css'

type Props = { open: boolean; title: string; onClose: () => void; children: ReactNode }

// Bottom sheet on the native <dialog>: showModal gives focus trap, inert page and Esc (cancel).
export default function Sheet({ open, title, onClose, children }: Props) {
  if (!open) return null
  return (
    <dialog
      ref={(d) => {
        if (d && !d.open) d.showModal()
      }}
      aria-label={title}
      className="ui-sheet"
      onCancel={(e) => {
        e.preventDefault() // the open prop decides; the parent closes via onClose
        onClose()
      }}
    >
      <header>
        <h2>{title}</h2>
        <button type="button" className="ui-btn ui-btn-link" onClick={onClose}>
          Close
        </button>
      </header>
      {children}
    </dialog>
  )
}
