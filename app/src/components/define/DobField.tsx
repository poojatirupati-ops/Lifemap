import type { FormEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { checkDob } from '../../domain/identity/dob.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { localToday } from '../../lib/today.ts'
import { useStore } from '../../state/store.ts'
import type { Dob, Provenance } from '../../state/types.ts'
import { dobKey, setDobPart, type Who } from '../../state/about.ts'
import Emo from '../ui/Emo.tsx'

/** Where the partner's age came from. */
const TAGS: Record<Provenance | 'none', [className: string, text: string]> = {
  doc: ['tag doc', '✅ From document'],
  typed: ['tag typed', '✏️ Your figure'],
  pre: ['tag pre', '✏️ Your figure · from your answers'],
  none: ['tag none', '❓ Missing'],
}

const PARTS: {
  part: keyof Dob
  placeholder: string
  width: number
  label: string
  autofill: string
}[] = [
  { part: 'day', placeholder: 'DD', width: 64, label: 'Day of birth', autofill: 'bday-day' },
  { part: 'month', placeholder: 'MM', width: 64, label: 'Month of birth', autofill: 'bday-month' },
  { part: 'year', placeholder: 'YYYY', width: 92, label: 'Year of birth', autofill: 'bday-year' },
]

/** Day, month and year boxes; a full day or month moves on to the next box. */
export default function DobField({ who }: { who: Who }) {
  const you = who === 'you'
  const id = dobKey(who)
  const today = localToday()
  const { dob, partnerName, ageSource, startYear } = useStore(
    useShallow(({ plan }) => ({
      dob: plan.about[id],
      partnerName: plan.partner.name,
      ageSource: plan.sources.pAge,
      startYear: assumption(plan, 'startYear'),
    })),
  )
  const check = checkDob(dob, who, { today, name: partnerName, startYear })
  const tag = TAGS[ageSource ?? 'none']

  const onInput = (part: keyof Dob) => (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const digits = input.value.replace(/\D/g, '').slice(0, part === 'year' ? 4 : 2)
    if (digits !== input.value) input.value = digits
    setDobPart(who, part, digits)
    if (part !== 'year' && digits.length === 2)
      (input.nextElementSibling as HTMLInputElement | null)?.focus()
  }

  return (
    <div className="field">
      <span className="flabel" id={`lab-${id}`}>
        {you ? 'Your date of birth' : 'Their date of birth'}{' '}
        <span id={`tag-${id}`}>
          {you ? null : (
            <span className={tag[0]}>
              <Emo>{tag[1]}</Emo>
            </span>
          )}
        </span>
      </span>
      <div
        className="dobrow"
        role="group"
        aria-labelledby={`lab-${id}`}
        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
      >
        {PARTS.map(({ part, placeholder, width, label, autofill }) => (
          <input
            key={part}
            className="in dob"
            id={`${id}-${part}`}
            inputMode="numeric"
            autoComplete={you ? autofill : 'off'}
            maxLength={part === 'year' ? 4 : 2}
            placeholder={placeholder}
            aria-label={label}
            data-dob={`${who}|${part}`}
            style={{ width, textAlign: 'center' }}
            defaultValue={dob?.[part] ?? ''}
            onInput={onInput(part)}
          />
        ))}
      </div>
      <p
        className="small"
        id={`${id}-msg`}
        role="status"
        aria-live="polite"
        style={{
          margin: '6px 0 0',
          minHeight: 18,
          color: check.text && !check.ok ? 'var(--gap-t)' : 'var(--acc-d)',
        }}
      >
        {check.text}
      </p>
      <p className="small dobnote" style={{ margin: '2px 0 0' }}>
        🔒 Used for your ages only. Stays on your device.
      </p>
      {you ? null : (
        <div className="fhelp">
          <button
            className="link"
            data-a="fex"
            data-p="pAge"
            aria-haspopup="dialog"
            onClick={() => useStore.getState().openSheet('ex|pAge')}
          >
            Not sure? See an example
          </button>
        </div>
      )}
    </div>
  )
}
