import { useState } from 'react'
import type { YearRow } from '../../../domain/planning/project.ts'
import { rulesFor } from '../../../domain/planning/rates.ts'
import { retirementGoal } from '../../../domain/goals/goals.ts'
import { useChartKeys } from '../../../hooks/useChartKeys.ts'
import { useViewport } from '../../../hooks/useViewport.ts'
import { useStore } from '../../../state/store.ts'
import { chartWidth, defaultYear, markedGoals } from './cashflow.ts'
import CashflowChart from './CashflowChart.tsx'
import ChartLegend from './ChartLegend.tsx'
import ChartSummary from './ChartSummary.tsx'
import YearDetail from './YearDetail.tsx'

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

  return (
    <>
      <div
        className="row chead"
        style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
      >
        <p className="small" style={{ margin: 0 }}>
          Each bar is one year of spending: living costs, loans and goals. Tap a bar to see that
          year.
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
      <YearDetail row={row} retiring={row.age === retiringAge} />
      <ChartLegend
        showSavings={showSavings}
        hasRetirement={retiringAge != null}
        statePensionAge={statePensionAge}
      />
      <ChartSummary rows={rows} />
    </>
  )
}
