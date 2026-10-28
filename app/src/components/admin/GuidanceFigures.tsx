import { GUIDANCE_FIGURES } from '../../domain/planning/settings.data.ts'
import StandardGroup from './StandardGroup.tsx'

/** Figures shown only as guidance, never used as a default. */
export default function GuidanceFigures() {
  return (
    <StandardGroup name="set-guide" title="Guidance figures (no standard)">
      {Object.entries(GUIDANCE_FIGURES).map(([key, figure]) => (
        <div key={key} className="field" style={{ margin: '0 0 12px' }}>
          <span className="flabel">{figure.name}</span>
          <span className="small" style={{ display: 'block' }}>
            {String(figure.value)} · {figure.by} · as at {figure.asOf} ·{' '}
            <b>verify before release</b>
          </span>
        </div>
      ))}
      <p className="small">
        Life expectancy is only ever shown as guidance. It is never a default: each customer picks
        their own plan-until age.
      </p>
    </StandardGroup>
  )
}
