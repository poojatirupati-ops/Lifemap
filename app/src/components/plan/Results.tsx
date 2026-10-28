import { budget2027Note } from '../../domain/planning/rates.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { useStore } from '../../state/store.ts'
import GateNote from '../ui/GateNote.tsx'
import { missingChoices } from '../finance/requiredChoices.ts'
import FoundCard from './FoundCard.tsx'
import GoalsCard from './GoalsCard.tsx'
import ProfileBanner from './ProfileBanner.tsx'
import RoughNote from './RoughNote.tsx'
import WhatIfCard from './WhatIfCard.tsx'
import { bookAdviser, fixChoice, showSection } from './planActions.ts'
import { useProjection } from './useProjection.ts'

// TODO(R-22): import { openReport } from '../../report/openReport.tsx'
const openReport = () => useStore.getState().openSheet('report')

/** How each required choice is named on the gate card. */
const CHOICE_LABELS: Record<string, string> = {
  retireAge: 'Retirement age',
  planEnd: 'Plan until age',
  infl: 'Inflation',
  pRetireAge: "Partner's retirement age",
}

/** Your results: goals, what we found, foundations, what-if, at a glance and the three end actions. */
export default function Results() {
  const projection = useProjection()
  const openSheet = useStore((store) => store.openSheet)
  const { plan, base } = projection
  const missing = missingChoices(plan)
  if (missing.length)
    return (
      <GateNote
        where="res"
        missing={missing.map(({ key }) => ({ key, label: CHOICE_LABELS[key] }))}
        onChoose={fixChoice}
      />
    )

  return (
    <>
      <div className="prelim">
        <span aria-hidden="true">ℹ️</span>
        <span>
          Guidance from your figures, not financial advice.{' '}
          <button
            className="link"
            style={{ padding: 0, fontSize: 12.5 }}
            data-a="sheet"
            data-p="assume"
            onClick={() => openSheet('assume')}
          >
            What we assume
          </button>
        </span>
      </div>
      <RoughNote plan={plan} />
      <ProfileBanner plan={plan} />
      <GoalsCard {...projection} />
      <FoundCard plan={plan} projection={base} />
      {/* TODO(R-25): the foundations levels (fndHTML) */}
      <div className="card" id="r-fnd">
        <h3 className="h">Your financial foundations</h3>
        <p className="small" style={{ margin: '0 0 6px' }}>
          Good planning is built from the bottom up. Tap a level to see why it matters.
        </p>
      </div>
      <WhatIfCard
        goals={plan.goals}
        whatIf={plan.wi}
        base={base}
        withWhatIf={projection.withWhatIf}
      />
      {/* TODO(R-20): <Glance /> inside #r-glance */}
      <div className="card" id="r-glancec">
        <h3 className="h">Your future, at a glance</h3>
        <div id="r-glance"></div>
      </div>
      <div className="ends">
        <button className="btn navy" data-a="report" onClick={openReport}>
          ⬇ Download my plan
        </button>
        <button className="btn sun" data-a="book" onClick={bookAdviser}>
          📅 Book my adviser meeting
        </button>
        <button className="btn ghost" data-a="adjust" onClick={() => showSection('timeline')}>
          ✏️ Adjust my goals
        </button>
      </div>
      <p className="disc" id="b27-res">
        {budget2027Note(assumption(plan, 'startYear'))}
      </p>
      <p className="disc">
        Guidance, not advice. Projections are illustrative, use standard assumptions and are not
        guaranteed. Only an authorised adviser who knows your full situation can give advice.{' '}
        {plan.versions.length > 0 && (
          <button
            className="link"
            style={{ fontSize: 12, padding: 0 }}
            data-a="sheet"
            data-p="history"
            onClick={() => openSheet('history')}
          >
            Plan history ({plan.versions.length})
          </button>
        )}
      </p>
    </>
  )
}
