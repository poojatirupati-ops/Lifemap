import type { ReactNode } from 'react'

interface Props {
  label: string
  onStep: (by: -1 | 1) => void
  children: ReactNode
}

/** − value + */
export default function Stepper({ label, onStep, children }: Props) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button aria-label="Less" onClick={() => onStep(-1)}>
        −
      </button>
      <output aria-live="polite">{children}</output>
      <button aria-label="More" onClick={() => onStep(1)}>
        +
      </button>
    </div>
  )
}
