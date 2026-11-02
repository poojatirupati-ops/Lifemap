import type { Standard, StandardKey } from '../../domain/planning/settings.data.ts'
import { inputText } from './partnerFigure.ts'
import { takeEntry } from './takeEntry.ts'

const UNIT_SUFFIX: Partial<Record<Standard['unit'], string>> = { pct: '%', eur: '€', yrs: 'years' }

/** The partner's single figure for a standard. */
export default function FigureInput({ id, standard }: { id: StandardKey; standard: Standard }) {
  const shown = inputText(standard, standard.partnerValue)
  const percentHint = standard.unit === 'pct' ? ' (%)' : ''
  return (
    <div className="row" style={{ gap: 6 }}>
      <input
        className="in"
        style={{ width: 110 }}
        id={`set-${id}`}
        inputMode="decimal"
        aria-label={`Partner figure for ${standard.name}${percentHint}`}
        defaultValue={shown}
        placeholder={standard.value == null ? 'none' : inputText(standard, standard.value)}
        onBlur={takeEntry(id, standard, shown)}
      />
      <span className="small">{UNIT_SUFFIX[standard.unit] ?? ''}</span>
    </div>
  )
}
