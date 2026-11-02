import { useShallow } from 'zustand/react/shallow'
import { creditsFor, type Household } from '../../domain/finances/credits.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { useStore } from '../../state/store.ts'

/** The tax credits that need a Yes, as chips; each shows only when it can apply. */
export default function CredChips() {
  const household = useStore(
    useShallow(({ plan }): Household => ({
      startYear: assumption(plan, 'startYear'),
      home: plan.figures.home,
      deps: plan.about.dependants,
      partner: plan.about.partner,
      married: plan.about.married,
    })),
  )
  const chosen = useStore(({ plan }) => plan.about.taxCredits)
  const credits = creditsFor(household)
  if (!credits.length) return null
  return (
    <div
      className="field"
      style={{ margin: '14px 0 0', borderTop: '1px dashed var(--line)', paddingTop: 12 }}
    >
      <span className="flabel" id="cred-l">
        Do any of these apply to you?{' '}
        <span className="small" style={{ fontWeight: 600 }}>
          Optional
        </span>
      </span>
      <div className="chips" role="group" aria-labelledby="cred-l">
        {credits.map(({ key, label }) => (
          <button
            key={key}
            className={chosen?.[key] ? 'chip sm sel' : 'chip sm'}
            aria-pressed={!!chosen?.[key]}
            data-a="cred"
            data-p={key}
            onClick={() => useStore.getState().toggleCredit(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="small">{credits.map(({ detail }) => detail).join(' · ')}.</span>
    </div>
  )
}
