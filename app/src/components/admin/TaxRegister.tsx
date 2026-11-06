import { useState } from 'react'
import { useStore as useVanilla } from 'zustand'
import { percent } from '../../lib/format.ts'
import { taxSession, type TaxOverride, type TaxSession } from '../../domain/planning/rates.ts'
import { RULES_2027, TAX_STATUS, type TaxStatus } from '../../domain/planning/rules2027.data.ts'
import { taxRegister, type TaxRegisterRow } from '../../domain/planning/taxRegister.ts'

const YEAR_CHOICES = [
  [null, 'Automatic (by plan year)'],
  [2026, 'Force 2026'],
  [2027, 'Force 2027'],
] as const

const TAG: Record<TaxStatus, string> = {
  [TAX_STATUS.announced]: 'look',
  [TAX_STATUS.fallback]: 'none',
  [TAX_STATUS.verified]: 'doc',
  [TAX_STATUS.toVerify]: 'typed',
}

const isBands = (value: unknown): value is [number, number][] =>
  Array.isArray(value) && value.every(Array.isArray)

/** A register value as the admin reads it: bands, a yes / no, a rate, an amount or the rule's own shape. */
function figureText(value: unknown): string {
  if (value == null) return '—'
  if (isBands(value))
    return value
      .map(
        ([upTo, rate]) =>
          `${percent(rate)} to ${upTo === Infinity ? 'no limit' : upTo.toLocaleString('en-IE')}`,
      )
      .join(' · ')
  if (typeof value === 'object')
    return JSON.stringify(value, (_, x) => (x === Infinity ? 'no limit' : x))
      .replace(/"/g, '')
      .slice(0, 160)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number')
    return value > 0 && value < 1 ? percent(value) : value.toLocaleString('en-IE')
  return String(value)
}

/** Only single 2027 figures can be changed, not bands or switches. */
function editable(path: string) {
  const change = RULES_2027[path]
  return !!change && !Array.isArray(change.value) && typeof change.value !== 'boolean'
}

const forceYear = (year: TaxSession['year']) => taxSession.setState({ year })

/** Changes one rule's 2027 value or status for this session; a typed value is announced unless a status was picked. */
function overrideRule(path: string, change: TaxOverride) {
  const { overrides } = taxSession.getState()
  const override = { ...overrides[path], ...change }
  if ('value' in change && change.value != null && !override.status)
    override.status = TAX_STATUS.announced
  taxSession.setState({ overrides: { ...overrides, [path]: override } })
}

const PLAIN_NUMBER = /^\d+(\.\d+)?$/

/**
 * A typed 2027 value, or undefined when refused. Blank is no value. A number rule takes only a number:
 * "€46,500" -> 46500, "35%" -> 0.35. A text rule (a date) keeps the text.
 */
function readValue(path: string, text: string) {
  const typed = text.trim()
  if (typed === '') return null
  if (typeof RULES_2027[path].value !== 'number') return typed
  const digits = typed.replace(/^€\s*/, '').replace(/,/g, '')
  const rate = digits.endsWith('%')
  const figure = rate ? digits.slice(0, -1).trim() : digits
  if (!PLAIN_NUMBER.test(figure)) return undefined
  return rate ? Number(figure) / 100 : Number(figure)
}

function RuleEditor({ row, override }: { row: TaxRegisterRow; override?: TaxOverride }) {
  const shown = String(override?.value ?? RULES_2027[row.path].value)
  const [refused, setRefused] = useState(false)
  return (
    <>
      <span className="row" style={{ gap: 6, marginTop: 4 }}>
        <input
          key={shown}
          className="in"
          style={{ maxWidth: 120 }}
          aria-label={`2027 value for ${row.name}`}
          data-taxov={row.path}
          data-k="v"
          defaultValue={shown}
          inputMode="decimal"
          onBlur={(event) => {
            const input = event.target
            if (input.value === shown) return setRefused(false)
            const value = readValue(row.path, input.value)
            setRefused(value === undefined)
            if (value === undefined) input.value = shown
            else overrideRule(row.path, { value })
          }}
        />
        <select
          className="in"
          style={{ maxWidth: 190 }}
          aria-label={`Status for ${row.name}`}
          data-taxov={row.path}
          data-k="status"
          value={row.status2027}
          onChange={(event) => overrideRule(row.path, { status: event.target.value as TaxStatus })}
        >
          {Object.values(TAX_STATUS).map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </span>
      {refused ? (
        <span className="small" role="alert" style={{ display: 'block', color: 'var(--alert-t)' }}>
          That is not a number, so it was not used. Type a figure such as 46,500 or 35%.
        </span>
      ) : null}
    </>
  )
}

function RuleRow({ row, override }: { row: TaxRegisterRow; override?: TaxOverride }) {
  const line = { display: 'block' }
  return (
    <div className="field" style={{ margin: '0 0 14px' }}>
      <span className="flabel">
        {row.name}{' '}
        <span className={`tag ${TAG[row.status2027]}`}>
          {row.status2027}
          {row.admin ? ' · admin change' : ''}
        </span>
      </span>
      <span className="small" style={line}>
        2026: <b>{figureText(row.value2026)}</b> ({row.status2026}) · 2027:{' '}
        <b>{figureText(row.value2027)}</b>
        {row.fallback ? (
          <>
            {' '}
            <i>2026 rate carried forward: 2027 rate not confirmed</i>
          </>
        ) : null}
      </span>
      <span className="small" style={line}>
        Effective: {row.effective || '—'} · Last checked: {row.checked}
      </span>
      {row.note ? (
        <span className="small" style={line}>
          {row.note}
        </span>
      ) : null}
      <span className="small" style={{ ...line, wordBreak: 'break-all' }}>
        Source:{' '}
        {/^https?:/.test(row.source) ? (
          <a href={row.source} target="_blank" rel="noopener">
            {row.source}
          </a>
        ) : (
          row.source
        )}
      </span>
      {editable(row.path) ? <RuleEditor row={row} override={override} /> : null}
    </div>
  )
}

const summary = { cursor: 'pointer', fontWeight: 800, minHeight: 44 }

/** The tax rules register for the admin: 2026 and 2027 side by side, one tax year forced, and 2027 figures changed for this session. */
export default function TaxRegister() {
  const { year, overrides } = useVanilla(taxSession)
  const rows = taxRegister(overrides)
  const count = (status: TaxStatus) => rows.filter((row) => row.status2027 === status).length
  // rows by category, in register order (Map.groupBy needs Safari 17.4)
  const categories: Record<string, TaxRegisterRow[]> = {}
  for (const row of rows) (categories[row.category] ??= []).push(row)
  return (
    <details className="card asmg" data-g="set-tax">
      <summary style={summary}>Tax rules register: 2026 and 2027 ({rows.length} figures)</summary>
      <div style={{ marginTop: 10 }}>
        <p className="small" style={{ margin: '0 0 8px' }}>
          Every plan year loads its own tax year (effective dates, then the 2026 figure carried
          forward where 2027 is not announced). 2027: <b>{count(TAX_STATUS.announced)}</b> announced
          or provisional, <b>{count(TAX_STATUS.fallback)}</b> carried forward from 2026,{' '}
          <b>{count(TAX_STATUS.toVerify)}</b> need verification. Nothing is marked Verified for
          2027: the official Revenue, Social Protection and Oireachtas pages could not be opened.
          Last checks are shown on each row.
        </p>
        <div
          className="row"
          style={{ gap: 6, flexWrap: 'wrap', margin: '0 0 10px' }}
          role="group"
          aria-label="Compare one tax year for the whole plan"
        >
          {YEAR_CHOICES.map(([choice, label]) => (
            <button
              key={label}
              className={`chip sm${choice === year ? ' sel' : ''}`}
              aria-pressed={choice === year}
              onClick={() => forceYear(choice)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="small" style={{ margin: '0 0 8px' }}>
          Forcing a year is for comparing scenarios; it changes this plan only, not the register.
          Changes made below apply to this session only.
        </p>
        {Object.entries(categories).map(([category, inCategory]) => (
          <details
            key={category}
            className="card"
            style={{ margin: '0 0 8px', boxShadow: 'none', border: '1px solid var(--line)' }}
          >
            <summary style={summary}>
              {category} ({inCategory.length})
            </summary>
            {inCategory.map((row) => (
              <RuleRow key={row.path} row={row} override={overrides[row.path]} />
            ))}
          </details>
        ))}
        {Object.keys(overrides).length ? (
          <button className="link" onClick={() => taxSession.setState({ overrides: {} })}>
            Remove all my changes
          </button>
        ) : null}
      </div>
    </details>
  )
}
