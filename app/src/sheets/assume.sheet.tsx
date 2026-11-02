import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import InflationChoice from '../components/finance/InflationChoice.tsx'
import { missingChoices } from '../domain/planning/requiredChoices.ts'
import GrowthSetToggle from '../components/me/GrowthSetToggle.tsx'
import GateNote from '../components/ui/GateNote.tsx'
import { assumption } from '../domain/planning/assumptions.ts'
import { budget2027Note, rulesVersion } from '../domain/planning/rates.ts'
import { useProjection } from '../hooks/useProjection.ts'
import { useStore } from '../state/store.ts'
import CloseButton from './CloseButton.tsx'
import {
  ASSUMED,
  GOVERNMENT,
  HOW,
  MINE,
  planAssumptions,
  type AssumptionRow,
} from '../domain/planning/assumptions/rows.ts'
import SheetTitle from './SheetTitle.tsx'

export const key = 'assume'

const GAP = { marginTop: 12 }
const TAG_CLASS: Record<string, string> = {
  [GOVERNMENT]: 'none',
  [MINE]: 'doc',
  [HOW]: 'typed',
  [ASSUMED]: 'look',
}

/** One assumption: its label, where it comes from, and the figure. */
function AssumptionRowView({ row }: { row: AssumptionRow }) {
  return (
    <div className="mini">
      <span>
        {row.label}
        <br />
        <span className={`tag ${TAG_CLASS[row.tag] ?? 'pre'}`}>{row.tag}</span>
        {row.note ? (
          <>
            <br />
            <span className="small">{row.note}</span>
          </>
        ) : null}
      </span>
      <b>{row.value}</b>
    </div>
  )
}

function changeAssumptions() {
  useStore.getState().openMe('asm')
}

/** Every figure the plan uses and where it comes from; set-by-law rows folded away. */
export function Body() {
  const { inputs } = useProjection()
  const extra = useStore(
    useShallow(({ plan }) => ({
      hasResults: plan.hasResults,
      retireSet: plan.retireSet,
      needs: plan.needs,
      ratesForAdviser: plan.ratesForAdviser,
    })),
  )
  const plan = useMemo(() => ({ ...inputs, ...extra }), [inputs, extra])
  const missing = missingChoices(plan)
  const rows = useMemo(() => planAssumptions(plan, !missing.length), [plan, missing.length])
  const government = rows.filter((row) => row.tag === GOVERNMENT)
  const year = assumption(plan, 'startYear')
  return (
    <>
      <SheetTitle>What your plan assumes</SheetTitle>
      <p className="small" style={{ margin: '0 0 8px' }}>
        Some values are set by law. The rest are your choice, with a suggestion or usual range to
        guide you.
      </p>
      <GateNote where="sheet" missing={missing} onChoose={useStore.getState().fixChoice} />
      <div className="card" style={{ boxShadow: 'none', background: 'var(--mist)' }}>
        {rows
          .filter((row) => row.tag !== GOVERNMENT)
          .map((row) => (
            <AssumptionRowView key={row.label} row={row} />
          ))}
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>
            {GOVERNMENT} ({government.length})
          </summary>
          {government.map((row) => (
            <AssumptionRowView key={row.label} row={row} />
          ))}
        </details>
      </div>
      {extra.hasResults ? (
        <div style={GAP}>
          <b style={{ fontSize: 14 }}>Choose your growth assumptions</b>
          <GrowthSetToggle />
        </div>
      ) : null}
      <div style={GAP}>
        <InflationChoice place="sheet" />
      </div>
      <p className="small" style={{ margin: '10px 0 0' }}>
        {rulesVersion(year)}
      </p>
      <p className="small" id="b27-sheet" style={{ margin: '6px 0 0' }}>
        {budget2027Note(year)}
      </p>
      <button className="btn ghost" style={{ marginTop: 10 }} onClick={changeAssumptions}>
        Change your assumptions
      </button>
      <p className="disc">
        Figures are in today's money unless noted. Investments can fall as well as rise.
        Illustrative only; not a guarantee.
      </p>
      <CloseButton>Close</CloseButton>
    </>
  )
}
