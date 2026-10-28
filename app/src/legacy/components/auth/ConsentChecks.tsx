import { consents, copy, type ConsentKey } from './signIn.data.ts'

type Props = { value: Record<ConsentKey, boolean>; onChange: (k: ConsentKey, v: boolean) => void }

/** Always starts unticked (CBI 2025 ban on pre-selected confirmations). */
export default function ConsentChecks({ value, onChange }: Props) {
  return (
    <fieldset className="auth-form auth-consents">
      <legend>{copy.consentsLegend}</legend>
      {consents.map(c => (
        <label key={c.key} className="auth-consent">
          <input type="checkbox" checked={value[c.key]} onChange={e => onChange(c.key, e.target.checked)} />
          <span>{c.label}{c.required ? '' : ' (optional)'}</span>
        </label>
      ))}
    </fieldset>
  )
}
