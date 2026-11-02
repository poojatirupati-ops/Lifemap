import type { CSSProperties } from 'react'

const lineSwatch = (borderTop: string): CSSProperties => ({
  background: 'none',
  borderTop,
  height: 0,
  borderRadius: 0,
})

interface Props {
  showSavings: boolean
  hasRetirement: boolean
  statePensionAge: number
}

/** What the chart's colours, lines and marks mean. */
export default function ChartLegend({ showSavings, hasRetirement, statePensionAge }: Props) {
  return (
    <div className="legend">
      <span>
        <i className="sw" style={{ background: 'var(--good)' }} />
        ☀️ Teal: paid from income
      </span>
      <span>
        <i
          className="sw"
          style={{ background: 'var(--nudge)', boxShadow: 'inset 0 0 0 1px var(--nudge-edge)' }}
        />
        🌦️ Gold: paid from savings
      </span>
      <span>
        <i className="sw" style={{ background: 'var(--alert)' }} />
        ⛈️ Coral: shortfall, not covered
      </span>
      <span>
        <i className="sw" style={lineSwatch('2px dashed var(--ink)')} />
        Your income each year
      </span>
      {showSavings ? (
        <span>
          <i className="sw" style={lineSwatch('2px solid #6E8AA6')} />
          Savings left
        </span>
      ) : null}
      {hasRetirement ? (
        <span>
          <i className="sw" style={{ background: 'var(--ink)' }} />▼ Retirement starts
        </span>
      ) : null}
      <span>
        <b style={{ fontSize: 10, marginRight: 4 }}>SP</b>
        {`State Pension from ${statePensionAge}`}
      </span>
      <span>Emoji = a goal that year</span>
    </div>
  )
}
