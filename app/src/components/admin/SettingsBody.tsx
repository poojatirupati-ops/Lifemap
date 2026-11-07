import { useMemo, useState, type ComponentProps, type FocusEvent, type ReactNode } from 'react'
import { assumption } from '../../domain/planning/assumptions.ts'
import { partnerName, readEntry } from '../../domain/planning/partnerFigure.ts'
import { rulesFor } from '../../domain/planning/rates.ts'
import {
  GUIDANCE_FIGURES,
  STANDARD_GROUPS,
  type Standard,
  type StandardKey,
  type StandardValue,
} from '../../domain/planning/settings.data.ts'
import { standardOf, withPartnerFigures, type Settings } from '../../domain/planning/settings.ts'
import { backToStandards, renamePartner, setPartnerFigure, useTenant } from '../../shell/tenant.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import {
  choiceFor,
  choicesFor,
  formatFigure,
  inputText,
  limitsText,
  listItemText,
  refusedText,
} from './partnerFigure.ts'
import TaxRegister from './TaxRegister.tsx'

const UNIT_SUFFIX: Partial<Record<Standard['unit'], string>> = { pct: '%', eur: '€', yrs: 'years' }

/** One small line under a standard. */
function Line({ style, ...props }: ComponentProps<'span'>) {
  return <span className="small" style={{ display: 'block', ...style }} {...props} />
}

/** A collapsible card of settings, closed to start with. */
function StandardGroup({
  name,
  title,
  children,
}: {
  name: string
  title: string
  children: ReactNode
}) {
  return (
    <details className="card asmg" data-g={name}>
      <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>{title}</summary>
      <div style={{ marginTop: 10 }}>{children}</div>
    </details>
  )
}

/** Saves a tenant change; says so when it was not saved. */
async function save(change: Promise<string | null>) {
  const error = await change
  if (error) toast(`That change was not saved: ${error}`)
}

/** The partner's figures over LifeMap's standards: the signed-in tenant's. */
function usePartnerSettings() {
  const tenant = useTenant()
  return useMemo(() => withPartnerFigures(tenant?.name ?? '', tenant?.rates), [tenant])
}

type FigureProps = {
  id: StandardKey
  standard: Standard
  /** Takes a partner figure; null goes back to the standard. */
  onFigure: (figure: StandardValue) => void
  /** Says why a typed figure was refused. */
  onRefuse: (message: string) => void
}

/** Blur handler: takes a changed partner figure (item = one rate of a list); a refused one is undone. */
function takeEntry(
  { id, standard, onFigure, onRefuse }: FigureProps,
  shown: string,
  item?: number,
) {
  return (event: FocusEvent<HTMLInputElement>) => {
    const input = event.target
    if (input.value === shown) return
    const entry = readEntry(id, standard, input.value, item)
    if ('figure' in entry) return onFigure(entry.figure)
    input.value = shown
    onRefuse(refusedText(id, standard.unit, entry.refused))
  }
}

/** The partner's own figure: a pick for a choice (the first option is the LifeMap standard), three rates for a list, else one figure. */
function PartnerInput(props: FigureProps) {
  const { id, standard } = props
  if (standard.unit === 'choice')
    return (
      <select
        className="in"
        id={`set-${id}`}
        aria-label={`Partner figure for ${standard.name}`}
        defaultValue={standard.partnerValue == null ? '' : String(standard.partnerValue)}
        onChange={(event) => {
          const option = choiceFor(id, event.target.value)
          props.onFigure(option ? option[0] : null)
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
  if (standard.unit === 'pct3') {
    // a blank rate keeps the standard's
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
              onBlur={takeEntry(props, shown, item)}
            />
          )
        })}
        <span className="small">%</span>
      </div>
    )
  }
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
        onBlur={takeEntry(props, shown)}
      />
      <span className="small">{UNIT_SUFFIX[standard.unit] ?? ''}</span>
    </div>
  )
}

/** One standard: LifeMap's figure, where it comes from, and the partner's own figure. */
function StandardField({ id, settings }: { id: StandardKey; settings: Settings }) {
  const startYear = useStore((store) => assumption(store.plan, 'startYear'))
  const standard = standardOf(id, settings, rulesFor(startYear))
  const partner = partnerName(settings)
  const [refused, setRefused] = useState<string | null>(null)
  const onFigure = (figure: StandardValue) => {
    setRefused(null)
    void save(setPartnerFigure(id, figure))
  }
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
      <PartnerInput
        key={JSON.stringify(standard.partnerValue)}
        id={id}
        standard={standard}
        onFigure={onFigure}
        onRefuse={setRefused}
      />
      {limits ? <Line id={`setb-${id}`}>{limits}</Line> : null}
      {refused ? (
        <Line role="alert" style={{ color: 'var(--alert-t)' }} id={`setm-${id}`}>
          {refused}
        </Line>
      ) : null}
      {changed ? (
        <button className="link" onClick={() => onFigure(null)}>
          Reset
        </button>
      ) : null}
    </div>
  )
}

/** The partner's name (the tenant's), and a way back to LifeMap's own standards once any figure is changed. */
function PartnerCard({ settings }: { settings: Settings }) {
  const { partner } = settings
  const anyChanged = Object.values(settings.standards).some(
    (standard) => standard.partnerValue != null,
  )

  return (
    <div className="card">
      <div className="field" style={{ margin: 0 }}>
        <label htmlFor="set-partner">
          Partner name (customers then read "Suggested by …" beside any figure you change)
        </label>
        <input
          key={partner}
          className="in"
          id="set-partner"
          defaultValue={partner}
          autoComplete="off"
          placeholder="e.g. a credit union"
          onBlur={(event) => {
            if (event.target.value.trim() !== partner) void save(renamePartner(event.target.value))
          }}
        />
      </div>
      {anyChanged ? (
        <button
          className="link"
          style={{ marginTop: 8 }}
          onClick={() => void save(backToStandards())}
        >
          Back to the LifeMap standards
        </button>
      ) : null}
    </div>
  )
}

/** The admin Settings page's content: who controls the standards, the partner's name, every standard by group, the tax rules register and guidance-only figures. */
export default function SettingsBody() {
  const settings = usePartnerSettings()
  return (
    <>
      <div
        className="note"
        role="note"
        style={{ background: '#FFF3CD', border: '1.5px solid #E0B84A' }}
      >
        <b>🔒 Admin view · not for customers.</b> LifeMap or a partner (credit union, adviser firm,
        company, agent) controls these standards. A figure changed here changes the suggestion
        everywhere, in the app and in the workbook's Settings sheet. Customers can still change any
        of them for their own plan. Law values (tax, USC, PRSI, pension relief, State Pension,
        Central Bank limits) are not here and can't be changed. Retirement age and life expectancy
        have no standard.
      </div>
      <PartnerCard settings={settings} />
      {Object.entries(STANDARD_GROUPS).map(([group, keys = []]) => (
        <StandardGroup key={group} name={`set-${group}`} title={`${group} (${keys.length})`}>
          {keys.map((standardKey) => (
            <StandardField key={standardKey} id={standardKey} settings={settings} />
          ))}
        </StandardGroup>
      ))}
      <TaxRegister />
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
    </>
  )
}
