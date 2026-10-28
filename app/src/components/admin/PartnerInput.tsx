import type { FocusEvent } from 'react'
import type { StandardKey } from '../../domain/planning/settings.ts'
import type { Standard } from '../../domain/planning/settings.data.ts'
import { choicesFor, inputText, listItemText, placeholderText, readEntry } from './partnerFigure.ts'
import { useSettings } from './settingsStore.ts'

const UNIT_SUFFIX: Record<string, string> = { pct: '%', eur: '€', yrs: 'years' }

/** Takes a partner figure when the input loses focus with a changed value; a refused one is undone. */
function take(key: StandardKey, standard: Standard, shown: string, item?: number) {
  return (event: FocusEvent<HTMLInputElement>) => {
    const input = event.target
    if (input.value === shown) return
    const entry = readEntry(key, standard, input.value, item)
    const { setPartnerFigure, refuse } = useSettings.getState()
    if ('refused' in entry) {
      input.value = shown
      refuse(key, entry.refused)
    } else setPartnerFigure(key, entry.figure)
  }
}

/** The partner's own figure: a pick for a choice, three percents for a list, else one figure. */
export default function PartnerInput({ id, standard }: { id: StandardKey; standard: Standard }) {
  const figure = standard.partnerValue

  if (standard.unit === 'choice')
    return (
      <select
        className="in"
        id={`set-${id}`}
        aria-label={`Partner figure for ${standard.name}`}
        defaultValue={figure == null ? '' : String(figure)}
        onChange={(event) => {
          const entry = readEntry(id, standard, event.target.value)
          if ('figure' in entry) useSettings.getState().setPartnerFigure(id, entry.figure)
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

  if (standard.unit === 'pct3')
    return (
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        {(standard.value as number[]).map((standardItem, item) => {
          const shown = figure ? listItemText((figure as number[])[item]) : ''
          return (
            <input
              key={item}
              className="in"
              style={{ width: 84 }}
              id={`set-${id}-${item}`}
              inputMode="decimal"
              aria-label={`Partner figure ${item + 1} for ${standard.name} (%)`}
              defaultValue={shown}
              placeholder={listItemText(standardItem)}
              onBlur={take(id, standard, shown, item)}
            />
          )
        })}
        <span className="small">%</span>
      </div>
    )

  const shown = inputText(standard, figure)
  return (
    <div className="row" style={{ gap: 6 }}>
      <input
        className="in"
        style={{ width: 110 }}
        id={`set-${id}`}
        inputMode="decimal"
        aria-label={`Partner figure for ${standard.name}${standard.unit === 'pct' ? ' (%)' : ''}`}
        defaultValue={shown}
        placeholder={placeholderText(standard)}
        onBlur={take(id, standard, shown)}
      />
      <span className="small">{UNIT_SUFFIX[standard.unit] ?? ''}</span>
    </div>
  )
}
