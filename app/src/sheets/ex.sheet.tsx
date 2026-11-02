import { FINANCE_FIELDS } from '../domain/finances/fields.data.ts'
import { fieldExamples } from '../domain/finances/examples.ts'
import { LIST_FIELDS } from '../domain/finances/lists.data.ts'
import { assumption } from '../domain/planning/assumptions.ts'
import { rules2026 } from '../domain/planning/rates.ts'
import { useStore } from '../state/store.ts'
import CloseButton from './CloseButton.tsx'

export const key = 'ex'
export const aria = { 'aria-labelledby': 'ex-t', 'aria-describedby': 'ex-s' }

const NOTE = { margin: '0 0 8px' }

/** "Not sure? See an example": how the sample customers fill in this field, and where to find yours. */
export function Body({ param: field = '' }: { param?: string }) {
  const startYear = useStore((store) => assumption(store.plan, 'startYear'))
  const definition = FINANCE_FIELDS[field] ?? LIST_FIELDS[field]
  const example = fieldExamples({
    statePensionAge: rules2026.sp.age,
    fullPrsiYears: rules2026.sp.fullYears,
    planStartYear: startYear,
  })[field]
  if (!definition || !example) return null
  return (
    <>
      <h2 className="t" id="ex-t">
        Example: {definition.label}
      </h2>
      {example.options ? (
        <ul className="small" style={{ margin: '0 0 8px', paddingLeft: 18 }}>
          {example.options.map(([choice, meaning]) => (
            <li key={choice}>
              <b>{choice}</b>
              {meaning ? `: ${meaning}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="sub" style={NOTE} id="ex-s">
        {example.text}
      </p>
      <p className="small" style={NOTE}>
        <span aria-hidden="true">📍</span> <b>Where to find yours:</b> {example.where}
      </p>
      {definition.type === 'eur' ? (
        <p className="small" style={NOTE}>
          <b>Nothing to add? Enter 0.</b>
        </p>
      ) : null}
      <p className="small" style={{ margin: '0 0 12px', color: 'var(--muted)' }}>
        Example only. Not a typical or recommended amount.
      </p>
      <CloseButton>Got it</CloseButton>
    </>
  )
}
