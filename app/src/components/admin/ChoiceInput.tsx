import type { Standard, StandardKey } from '../../domain/planning/settings.data.ts'
import { useSettings } from '../../state/settings.ts'
import { choiceFor, choicesFor } from './partnerFigure.ts'

/** The partner's pick for a choice standard; the first option means the LifeMap standard. */
export default function ChoiceInput({ id, standard }: { id: StandardKey; standard: Standard }) {
  return (
    <select
      className="in"
      id={`set-${id}`}
      aria-label={`Partner figure for ${standard.name}`}
      defaultValue={standard.partnerValue == null ? '' : String(standard.partnerValue)}
      onChange={(event) => {
        const option = choiceFor(id, event.target.value)
        useSettings.getState().setPartnerFigure(id, option ? option[0] : null)
      }}
    >
      <option value="">LifeMap standard</option>
      {choicesFor(id).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )
}
