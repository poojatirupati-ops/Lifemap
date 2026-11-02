import { assumption } from '../../domain/planning/assumptions.ts'
import { partnerName } from '../../domain/planning/partnerFigure.ts'
import { rulesFor } from '../../domain/planning/rates.ts'
import type { StandardKey } from '../../domain/planning/settings.data.ts'
import { standardOf } from '../../domain/planning/settings.ts'
import { useSettings } from '../../state/settings.ts'
import { useStore } from '../../state/store.ts'
import Line from './Line.tsx'
import { formatFigure, limitsText } from './partnerFigure.ts'
import PartnerInput from './PartnerInput.tsx'

/** One standard: LifeMap's figure, where it comes from, and the partner's own figure. */
export default function StandardField({ id }: { id: StandardKey }) {
  const startYear = useStore((store) => assumption(store.plan, 'startYear'))
  // 'inv' is derived from other standards, so only it subscribes to the whole settings
  const shown = useSettings((store) =>
    id === 'inv' ? store.settings : store.settings.standards[id],
  )
  const standard = 'standards' in shown ? standardOf(id, shown, rulesFor(startYear)) : shown
  const partner = useSettings((store) => partnerName(store.settings))
  const refused = useSettings((store) => (store.refused?.key === id ? store.refused.message : null))
  const changed = standard.partnerValue != null
  const limits = limitsText(id, standard.unit)

  return (
    <div className="field" style={{ margin: '0 0 16px' }}>
      <span className="flabel" id={`setl-${id}`}>
        {standard.name}
        {changed ? (
          <>
            {' '}
            <span className="tag doc">Changed by {partner}</span>
          </>
        ) : null}
      </span>
      <Line>
        LifeMap standard: <b>{formatFigure(id, standard.unit, standard.value)}</b> ·{' '}
        {standard.label || standard.by} · as at {standard.asOf}
        {standard.verify ? (
          <>
            {' '}
            · <b>verify before release</b>
          </>
        ) : null}
      </Line>
      {standard.guide ? <Line>Guidance: {standard.guide}</Line> : null}
      {standard.note ? <Line>Note: {standard.note}</Line> : null}
      {standard.source ? (
        <Line style={{ wordBreak: 'break-all' }}>Source: {standard.source}</Line>
      ) : null}
      <Line style={{ margin: '4px 0' }}>
        Partner figure (leave blank for the LifeMap standard):
      </Line>
      {/* remount to reset the uncontrolled input after Reset or a refused entry */}
      <PartnerInput key={JSON.stringify(standard.partnerValue)} id={id} standard={standard} />
      {limits ? <Line id={`setb-${id}`}>{limits}</Line> : null}
      {refused ? (
        <Line role="alert" style={{ color: 'var(--alert-t)' }} id={`setm-${id}`}>
          {refused}
        </Line>
      ) : null}
      {changed ? (
        <button className="link" onClick={() => useSettings.getState().setPartnerFigure(id, null)}>
          Reset
        </button>
      ) : null}
    </div>
  )
}
