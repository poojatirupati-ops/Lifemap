import type { Standard, StandardKey } from '../../domain/planning/settings.data.ts'
import { listItemText } from './partnerFigure.ts'
import { takeEntry } from './takeEntry.ts'

type RateList = Extract<Standard, { unit: 'pct3' }>

/** The partner's three rates for a list standard; a blank one keeps the standard's. */
export default function RateListInput({ id, standard }: { id: StandardKey; standard: RateList }) {
  const figure = standard.partnerValue
  return (
    <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
      {standard.value.map((standardRate, item) => {
        const shown = figure ? listItemText(figure[item]) : ''
        return (
          <input
            key={item}
            className="in"
            style={{ width: 84 }}
            id={`set-${id}-${item}`}
            inputMode="decimal"
            aria-label={`Partner figure ${item + 1} for ${standard.name} (%)`}
            defaultValue={shown}
            placeholder={listItemText(standardRate)}
            onBlur={takeEntry(id, standard, shown, item)}
          />
        )
      })}
      <span className="small">%</span>
    </div>
  )
}
