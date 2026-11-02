import { assumption } from '../../domain/planning/assumptions.ts'
import { budget2027Note } from '../../domain/planning/rates.ts'
import { useMissingChoices } from '../../hooks/useMissingChoices.ts'
import { useProjection } from '../../hooks/useProjection.ts'
import { openReport } from '../../report/openReport.ts'
import { useStore } from '../../state/store.ts'
import Glance from '../results/Glance.tsx'
import GateNote from '../ui/GateNote.tsx'
import FoundCard from './FoundCard.tsx'
import GoalsCard from './GoalsCard.tsx'
import ProfileBanner from './ProfileBanner.tsx'
import RoughNote from './RoughNote.tsx'
import WhatIfCard from './WhatIfCard.tsx'

/** Your results: goals, what we found, foundations, what-if, at a glance and the three end actions. */
export default function Results() {
  const missing = useMissingChoices()
  const { inputs, whatIf, base, withWhatIf } = useProjection()
  const savedWhatIf = useStore((store) => store.plan.whatIf)
  const versions = useStore((store) => store.plan.versions.length)
  const openSheet = useStore((store) => store.openSheet)
  const fixChoice = useStore((store) => store.fixChoice)
  const bookAdviser = useStore((store) => store.bookAdviser)
  const showSection = useStore((store) => store.showSection)
  if (missing.length) return <GateNote where="res" missing={missing} onChoose={fixChoice} />

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
      <RoughNote />
      <ProfileBanner inputs={inputs} />
      <GoalsCard inputs={inputs} whatIf={whatIf} projection={withWhatIf} />
      <FoundCard inputs={inputs} projection={base} />
      {/* TODO(R-25): the foundations levels (fndHTML) */}
      <div className="card" id="r-fnd">
        <h3 className="h">Your financial foundations</h3>
        <p className="small" style={{ margin: '0 0 6px' }}>
          Good planning is built from the bottom up. Tap a level to see why it matters.
        </p>
      </div>
      <WhatIfCard goals={inputs.goals} whatIf={savedWhatIf} base={base} withWhatIf={withWhatIf} />
      <div className="card" id="r-glancec">
        <h3 className="h">Your future, at a glance</h3>
        <div id="r-glance">
          <Glance projection={withWhatIf} />
        </div>
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
        {budget2027Note(assumption(inputs, 'startYear'))}
      </p>
      <p className="disc">
        Guidance, not advice. Projections are illustrative, use standard assumptions and are not
        guaranteed. Only an authorised adviser who knows your full situation can give advice.{' '}
        {versions > 0 ? (
          <button
            className="link"
            style={{ fontSize: 12, padding: 0 }}
            data-a="sheet"
            data-p="history"
            onClick={() => openSheet('history')}
          >
            Plan history ({versions})
          </button>
        ) : null}
      </p>
    </>
  )
}
