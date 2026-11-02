import { planFigures, statementWinsNote } from '../../domain/finances/figures.ts'
import { useStore } from '../../state/store.ts'
import DocNote from './DocNote.tsx'
import ExampleLink from './ExampleLink.tsx'
import FieldTag from './FieldTag.tsx'
import { FINANCE_FIELDS, fieldValue } from '../../domain/finances/fields.data.ts'
import NumberBox from './NumberBox.tsx'
import WorkedOutNote from './WorkedOutNote.tsx'

const YES_NO_NOT_SURE = ['Yes', 'No', 'Not sure']

/** One Your finances figure: chips for a choice, otherwise a typed box. */
export default function FinField({ field }: { field: string }) {
  const { label, type, options, hint } = FINANCE_FIELDS[field]
  const value = useStore(({ plan }) => fieldValue(field, plan))
  const docNote = useStore(({ plan }) =>
    statementWinsNote(planFigures(plan), field, type === 'eur'),
  )
  const tag = (
    <span id={`tag-${field}`}>
      <FieldTag field={field} />
    </span>
  )

  if (type === 'choice' || type === 'ynn') {
    return (
      <div className="field">
        <span className="flabel">
          {label} {tag}
        </span>
        <div className="chips" role="group" aria-label={label}>
          {(options ?? YES_NO_NOT_SURE).map((option) => (
            <button
              key={option}
              className={value === option ? 'chip sm sel' : 'chip sm'}
              aria-pressed={value === option}
              data-a="fchoice"
              data-p={`${field}|${option}`}
              onClick={() => useStore.getState().chooseField(field, option)}
            >
              {option}
            </button>
          ))}
        </div>
        {docNote ? (
          <span className="small" style={{ display: 'block', color: 'var(--acc-d)' }} role="status">
            {docNote}
          </span>
        ) : null}
        <ExampleLink field={field} />
      </div>
    )
  }

  const id = `f-${field}`
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {tag}
      </label>
      <NumberBox
        id={id}
        kind={type}
        value={value}
        maxPercent={30}
        data-fin={field}
        aria-describedby={hint ? `h-${field}` : undefined}
        onValue={(typed) => useStore.getState().typeField(field, typed)}
      />
      <DocNote id={`dn-${field}`} note={docNote} />
      {hint ? (
        <span className="small" id={`h-${field}`}>
          {hint}
        </span>
      ) : null}
      <WorkedOutNote field={field} />
      {type !== 'text' ? <ExampleLink field={field} /> : null}
    </div>
  )
}
