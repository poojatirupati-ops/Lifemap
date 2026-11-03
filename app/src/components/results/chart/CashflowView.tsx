import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { YearRow } from '../../../domain/planning/project.ts'
import { rulesFor } from '../../../domain/planning/rates.ts'
import { retirementGoal } from '../../../domain/goals/goals.ts'
import { useViewport } from '../../../hooks/useViewport.ts'
import { clamp } from '../../../lib/clamp.ts'
import { euro } from '../../../lib/format.ts'
import { useStore } from '../../../state/store.ts'
import Emo from '../../ui/Emo.tsx'
import { chartWidth, defaultYear, hasShortfall, markedGoals, yearSplit } from './cashflow.ts'
import CashflowChart from './CashflowChart.tsx'

const STEP: Partial<Record<string, number>> = {
  ArrowRight: 1,
  ArrowUp: 1,
  ArrowLeft: -1,
  ArrowDown: -1,
}

/** The chart's chosen year: a tap picks one, arrows step, Home and End jump to the ends. */
function useChartKeys(count: number, defaultIndex: number) {
  const [chosen, setChosen] = useState<number | null>(null)
  const toRange = (index: number) => clamp(index, 0, count - 1)
  const selected = toRange(chosen ?? defaultIndex)

  const onKeyDown = (event: KeyboardEvent) => {
    const step = STEP[event.key]
    if (event.key === 'Home') setChosen(0)
    else if (event.key === 'End') setChosen(count - 1)
    else if (step != null) setChosen(toRange(selected + step))
    else return
    event.preventDefault()
  }

  return { selected, select: (index: number) => setChosen(toRange(index)), onKeyDown }
}

const lineSwatch = (borderTop: string): CSSProperties => ({
  background: 'none',
  borderTop,
  height: 0,
  borderRadius: 0,
})

const years = (count: number) => `${count} ${count === 1 ? 'year' : 'years'}`

const unpaidGoals = (row: YearRow) =>
  row.goalsDue.filter((goal) => goal.paid < goal.cost - 1).map((goal) => goal.name)

/** A label and amount on one line, with an optional colour swatch matching the chart. */
function MiniLine({ label, amount, colour }: { label: string; amount: number; colour?: string }) {
  return (
    <div className="mini">
      <span>
        {colour ? <i className="sw" style={{ background: colour, marginRight: 6 }} /> : null}
        <Emo>{label}</Emo>
      </span>
      <b>{euro(amount)}</b>
    </div>
  )
}

/** The chart in words: every year covered, or where the gaps are and how big. */
function ChartSummary({ rows }: { rows: YearRow[] }) {
  const short = rows.filter(hasShortfall)
  if (!short.length) {
    const usingSavings = rows.filter((row) => yearSplit(row).fromSavings > 0.5).length
    const savingsNote = usingSavings
      ? `, and in ${years(usingSavings)} you use savings, which is what they are for`
      : ''
    return (
      <p className="pnote">
        <span className="pn-l">In plain English</span>
        {` every year is covered by your income and savings${savingsNote}. No coral on the chart.`}
      </p>
    )
  }

  const [first] = short
  const firstGoals =
    first.goalGap > 0.5 && first.goalsDue.length
      ? ` (${unpaidGoals(first).join(' and ').toLowerCase()})`
      : ''
  const total = short.reduce((sum, row) => sum + row.shortfall, 0)
  const goals = [...new Set(short.flatMap(unpaidGoals))]
  const livingShort = short.filter((row) => row.livingShortfall > 0.5)
  const gapYears = short.length > 1 ? `are ${short.length} years` : 'is 1 year'
  const goalsNote = goals.length ? `. Goals involved: ${goals.join(', ').toLowerCase()}` : ''
  const livingNote = livingShort.length
    ? `. Everyday costs run short in ${years(livingShort.length)}, from age ${livingShort[0].age}`
    : ''
  return (
    <p className="pnote">
      <span className="pn-l">In plain English</span> the first shortfall is at{' '}
      <b>age {first.age}</b>, about <b>{euro(first.shortfall)}</b>
      {`${firstGoals}. Across your plan there ${gapYears} with a gap, about ${euro(total)} in total`}
      {goalsNote}
      {livingNote}. Saving more, changing timing or rethinking a goal closes it.
    </p>
  )
}

/** The results page's Detail view: a bar per year, the chosen year's detail, legend and summary. */
export default function CashflowView({ rows }: { rows: YearRow[] }) {
  const goals = useStore((store) => store.plan.goals)
  const viewport = useViewport(false)
  const [showSavings, setShowSavings] = useState(false)
  const retiringAge = retirementGoal(goals)
    ? rows.find((row) => row.retiresThisYear)?.age
    : undefined
  const { selected, select, onKeyDown } = useChartKeys(rows.length, defaultYear(rows, retiringAge))
  const statePensionAge = rulesFor(rows[0].year).sp.age
  const row = rows[selected]
  const split = yearSplit(row)
  const dueGoals = row.goalsDue.map((goal) => goal.name).join(', ')
  const retiring = row.age === retiringAge

  return (
    <>
      <div
        className="row chead"
        style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
      >
        <p className="small" style={{ margin: 0 }}>
          One bar per year of spending. Tap a bar to see that year.
        </p>
        <button
          className={showSavings ? 'chip sm sel' : 'chip sm'}
          aria-pressed={showSavings}
          style={{ flexShrink: 0 }}
          onClick={() => setShowSavings(!showSavings)}
        >
          Show savings
        </button>
      </div>
      <div
        className="cwrap"
        tabIndex={0}
        role="slider"
        aria-label="Year in the cashflow chart. Use the arrow keys to move between years."
        aria-valuemin={rows[0].age}
        aria-valuemax={rows[rows.length - 1].age}
        aria-valuenow={row.age}
        aria-valuetext={`Age ${row.age}, ${row.year}`}
        data-ckey="1"
        onKeyDown={onKeyDown}
      >
        <CashflowChart
          rows={rows}
          width={chartWidth(viewport)}
          selected={selected}
          onSelect={select}
          showSavings={showSavings}
          goals={markedGoals(goals)}
          retiringAge={retiringAge}
          statePensionAge={statePensionAge}
        />
      </div>
      <div className="cdet" id="r-cdet" aria-live="polite">
        <div className="cdh">
          <b>
            {`Age ${row.age} `}
            <span>{`(${row.year})`}</span>
            {retiring ? ' · retirement starts' : null}
          </b>
          <span className="small">Tap a bar or use ← →</span>
        </div>
        <MiniLine label="Income" amount={row.inflow} />
        <MiniLine label="Spending" amount={split.spending} />
        <div className="csub">
          <MiniLine label="Living costs" amount={row.living} />
          <MiniLine label="Loans & mortgage" amount={row.repayments} />
          {row.goalCost > 0.5 ? (
            <MiniLine label={`Goals: ${dueGoals}`} amount={row.goalCost} />
          ) : null}
        </div>
        <MiniLine label="Paid from income" amount={split.fromIncome} colour="var(--good)" />
        <MiniLine label="Paid from savings" amount={split.fromSavings} colour="var(--nudge)" />
        <MiniLine label="Shortfall" amount={split.shortfall} colour="var(--alert)" />
        <MiniLine label="Savings left at year end" amount={row.liquid} />
      </div>
      <div className="legend lg2">
        <span>
          <i className="sw" style={{ background: 'var(--good)' }} />
          Paid from income
        </span>
        <span>
          <i
            className="sw"
            style={{ background: 'var(--nudge)', boxShadow: 'inset 0 0 0 1px var(--nudge-edge)' }}
          />
          Paid from savings
        </span>
        <span>
          <i className="sw" style={{ background: 'var(--alert)' }} />
          Shortfall
        </span>
        <span>
          <i className="sw" style={lineSwatch('2px dashed var(--ink)')} />
          Your income
        </span>
        {showSavings ? (
          <span>
            <i className="sw" style={lineSwatch('2px solid #6E8AA6')} />
            Savings left
          </span>
        ) : null}
        {retiringAge != null ? (
          <span>
            <b className="lgm">▼</b>Retirement starts
          </span>
        ) : null}
        <span>
          <b className="lgm">SP</b>
          {`State Pension from ${statePensionAge}`}
        </span>
        <span>
          <b className="lgm">●</b>Top icon = a goal
        </span>
      </div>
      <ChartSummary rows={rows} />
    </>
  )
}
