import type { ReactNode } from 'react'

/** The original's sheet shell: backdrop (click closes), dialog named by its heading (#sheet-t unless `aria` says otherwise), grab handle, close button. */
export default function SheetFrame({
  chat,
  aria = { 'aria-labelledby': 'sheet-t' },
  onClose,
  children,
}: {
  chat?: boolean
  aria?: Record<string, string>
  onClose: () => void
  children?: ReactNode
}) {
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div
        className={'sheet' + (chat ? ' chatsheet' : '')}
        role="dialog"
        aria-modal="true"
        {...aria}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grab"></div>
        <button className="sx" aria-label="Close" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
