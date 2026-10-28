import { statementWinsNote } from '../../domain/finances/figures.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'
import { workedOutNote } from './checkList.ts'
import DocNote from './DocNote.tsx'
import ExampleLink from './ExampleLink.tsx'
import FieldTag from './FieldTag.tsx'
import { FINANCE_FIELDS, fieldValue } from './fields.data.ts'
import NumberBox from './NumberBox.tsx'
import { chooseField, typeField } from './sectionActions.ts'

const YES_NO_NOT_SURE = ['Yes', 'No', 'Not sure']
const REPAYMENTS = ['mortPayM', 'cardPayM', 'loanPayM']

const docNoteFor = (key: string, plan: Plan) =>
  statementWinsNote(
    plan.src[key] === 'doc',
    plan.man[key],
    plan.fin[key],
    FINANCE_FIELDS[key].type === 'eur',
  )

/** One Your finances figure: chips for a choice, otherwise a typed box. */
export default function FinField({ field }: { field: string }) {
  const { label, type, options, hint } = FINANCE_FIELDS[field]
  const value = useStore(({ plan }) => fieldValue(field, plan))
  const docNote = useStore(({ plan }) => docNoteFor(field, plan))
  const worked = useStore(({ plan }) =>
    REPAYMENTS.includes(field) ? workedOutNote(field, plan) : '',
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
              onClick={() => chooseField(field, option)}
            >
              {option}
            </button>
          ))}
        </div>
        {docNote && (
          <span className="small" style={{ display: 'block', color: 'var(--acc-d)' }} role="status">
            {docNote}
          </span>
        )}
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
        onValue={(typed) => typeField(field, typed)}
      />
      <DocNote id={`dn-${field}`} note={docNote} />
      {hint && (
        <span className="small" id={`h-${field}`}>
          {hint}
        </span>
      )}
      {worked && (
        <span
          className="small"
          id={`wo-${field}`}
          style={{ display: 'block', color: 'var(--sea-d)' }}
        >
          {worked}
        </span>
      )}
      {type !== 'text' && <ExampleLink field={field} />}
    </div>
  )
}
