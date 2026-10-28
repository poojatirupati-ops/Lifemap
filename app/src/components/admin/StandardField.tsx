import type { StandardKey } from '../../domain/planning/settings.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { rulesFor } from '../../domain/planning/rates.ts'
import { useStore } from '../../state/store.ts'
import { formatFigure, limitsText, shownStandard } from './partnerFigure.ts'
import PartnerInput from './PartnerInput.tsx'
import { partnerName, useSettings } from './settingsStore.ts'

const LINE = { display: 'block' } as const

/** One standard: LifeMap's figure, where it comes from, and the partner's own figure. */
export default function StandardField({ id }: { id: StandardKey }) {
  const settings = useSettings((store) => store.settings)
  const refused = useSettings((store) => (store.refused?.key === id ? store.refused.message : null))
  const startYear = useStore((store) => assumption(store.plan, 'startYear'))
  const standard = shownStandard(id, settings, rulesFor(startYear))
  const changed = standard.partnerValue != null
  const limits = limitsText(id, standard.unit)

  return (
    <div className="field" style={{ margin: '0 0 16px' }}>
      <span className="flabel" id={`setl-${id}`}>
        {standard.name}
        {changed ? (
          <>
            {' '}
            <span className="tag doc">Changed by {partnerName(settings)}</span>
          </>
        ) : null}
      </span>
      <span className="small" style={LINE}>
        LifeMap standard: <b>{formatFigure(id, standard.unit, standard.value)}</b> ·{' '}
        {standard.label || standard.by} · as at {standard.asOf}
        {standard.verify ? (
          <>
            {' · '}
            <b>verify before release</b>
          </>
        ) : null}
      </span>
      {standard.guide ? (
        <span className="small" style={LINE}>
          Guidance: {standard.guide}
        </span>
      ) : null}
      {standard.note ? (
        <span className="small" style={LINE}>
          Note: {standard.note}
        </span>
      ) : null}
      {standard.source ? (
        <span className="small" style={{ display: 'block', wordBreak: 'break-all' }}>
          Source: {standard.source}
        </span>
      ) : null}
      <span className="small" style={{ display: 'block', margin: '4px 0' }}>
        Partner figure (leave blank for the LifeMap standard):
      </span>
      <PartnerInput key={JSON.stringify(standard.partnerValue)} id={id} standard={standard} />
      {limits ? (
        <span className="small" style={LINE} id={`setb-${id}`}>
          {limits}
        </span>
      ) : null}
      {refused ? (
        <span
          className="small"
          role="alert"
          style={{ display: 'block', color: 'var(--alert-t)' }}
          id={`setm-${id}`}
        >
          {refused}
        </span>
      ) : null}
      {changed ? (
        <button className="link" onClick={() => useSettings.getState().setPartnerFigure(id, null)}>
          Reset
        </button>
      ) : null}
    </div>
  )
}
