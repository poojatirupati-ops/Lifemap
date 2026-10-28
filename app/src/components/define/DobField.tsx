import type { FormEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { checkDob } from '../../domain/identity/dob.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { localToday } from '../../lib/today.ts'
import { useStore } from '../../state/store.ts'
import type { Dob } from '../../state/types.ts'
import { setDobPart, type Who } from './aboutActions.ts'
import SourceTag from './SourceTag.tsx'

const PARTS: { part: keyof Dob; placeholder: string; width: number; label: string }[] = [
  { part: 'd', placeholder: 'DD', width: 64, label: 'Day of birth' },
  { part: 'm', placeholder: 'MM', width: 64, label: 'Month of birth' },
  { part: 'y', placeholder: 'YYYY', width: 92, label: 'Year of birth' },
]
const AUTOFILL = { d: 'bday-day', m: 'bday-month', y: 'bday-year' }
// tools/view-equal.mjs pins the browser's today with window.__TODAY
const today = () => localToday((globalThis as { __TODAY?: string }).__TODAY)

/** Day, month and year boxes; a full day or month moves on to the next box. */
export default function DobField({ who }: { who: Who }) {
  const you = who === 'you'
  const id = you ? 'dob' : 'pdob'
  const { dob, partnerName, ageSource, startYear } = useStore(
    useShallow(({ plan }) => ({
      dob: you ? plan.about.dob : plan.about.pdob,
      partnerName: plan.partner.name,
      ageSource: plan.src.pAge,
      startYear: assumption(plan, 'startYear', today()),
    })),
  )
  const check = checkDob(dob, who, { today: today(), name: partnerName, startYear })

  const onInput = (part: keyof Dob) => (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const digits = input.value.replace(/\D/g, '').slice(0, part === 'y' ? 4 : 2)
    if (digits !== input.value) input.value = digits
    setDobPart(who, part, digits)
    if (part !== 'y' && digits.length === 2) {
      document.getElementById(`${id}-${part === 'd' ? 'm' : 'y'}`)?.focus()
    }
  }

  return (
    <div className="field">
      <span className="flabel" id={`lab-${id}`}>
        {you ? 'Your date of birth' : 'Their date of birth'}{' '}
        <span id={`tag-${id}`}>{!you && <SourceTag source={ageSource} />}</span>
      </span>
      <div
        className="dobrow"
        role="group"
        aria-labelledby={`lab-${id}`}
        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
      >
        {PARTS.map(({ part, placeholder, width, label }) => (
          <input
            key={part}
            className="in dob"
            id={`${id}-${part}`}
            inputMode="numeric"
            autoComplete={you ? AUTOFILL[part] : 'off'}
            maxLength={part === 'y' ? 4 : 2}
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
      {!you && (
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
