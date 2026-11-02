import { useStore } from '../../state/store.ts'
import { toggleMarried } from '../../state/about.ts'

/** Optional: married or in a civil partnership means joint assessment for income tax. */
export default function MarriedField() {
  const married = useStore((store) => store.plan.about.married)

  return (
    <div style={{ margin: '10px 0 0' }}>
      <span className="flabel" style={{ fontSize: 13.5 }}>
        Married or in a civil partnership?{' '}
        <span className="small" style={{ fontWeight: 600 }}>
          Optional
        </span>
      </span>
      <div
        className="seg"
        role="group"
        aria-label="Married or in a civil partnership"
        style={{ margin: '6px 0 0' }}
      >
        {[true, false].map((answer) => {
          const label = answer ? 'Yes' : 'No'
          const on = married === answer
          return (
            <button
              key={label}
              className={on ? 'on' : ''}
              aria-pressed={on}
              data-a="married"
              data-p={label}
              onClick={() => toggleMarried(answer)}
            >
              {label}
            </button>
          )
        })}
      </div>
      <span className="small">
        If yes, we use joint assessment for income tax, which can lower your tax.
      </span>
    </div>
  )
}
