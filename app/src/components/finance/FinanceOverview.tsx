import { useStore } from '../../state/store.ts'
import { goTo } from '../../shell/router.ts'
import FlowScreen from '../frame/FlowScreen.tsx'
import SectionRow from './SectionRow.tsx'
import { backToMe } from '../../state/finances.ts'
import { hasMinimumFinances, sectionStatus, sectionSummary } from './status.ts'
import { useFinancePlan } from '../../hooks/useCheckPlan.ts'
import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'

/** Your finances (P2): in the plan builder, or under Me or Experts in the app. */
export default function FinanceOverview() {
  const inApp = useStore(({ plan }) => plan.hasResults)
  const missingDocs = useStore(({ plan }) => plan.missingDocs)
  const plan = useFinancePlan()
  const statuses = FINANCE_SECTIONS.map((section) => sectionStatus(section, plan))
  const done = statuses.filter((status) => status === 'done').length
  const ready = hasMinimumFinances(plan)

  return (
    <FlowScreen
      id="P2"
      note="Your finances hub: 6 sections, each Upload or Type it. One smart upload at the top. Minimum = About you + Income + Assets or Pension."
      eye="Step 3 · Prepare"
      title="Your finances"
      sub="Add your money once. Rough figures are fine."
      back={inApp ? backToMe : undefined}
      foot={
        // a fragment, so the in-app foot stays an empty .foot
        <>
          {inApp ? null : (
            <button
              className="btn"
              data-a="go"
              data-p="P4"
              disabled={!ready}
              onClick={() => goTo('/build/check')}
            >
              Check my details
            </button>
          )}
        </>
      }
    >
      <div className="card row" style={{ background: 'var(--sea-l)' }}>
        <span style={{ fontSize: 30 }} aria-hidden="true">
          📥
        </span>
        <div style={{ flex: 1 }}>
          <b>Add any documents</b>
          <div className="small" style={{ color: 'var(--ink)' }}>
            We'll sort them into the right sections. You check what we read.
          </div>
        </div>
        <button
          className="btn sm"
          data-a="upl"
          data-p="smart"
          onClick={() => useStore.getState().startUpload('smart', ['Sample document.pdf'])}
        >
          Upload
        </button>
      </div>
      <div className="row" style={{ margin: '16px 0 8px', justifyContent: 'space-between' }}>
        <b>
          {done} of {FINANCE_SECTIONS.length} done
        </b>
        <span className="small">Skip any you like</span>
      </div>
      {FINANCE_SECTIONS.map((section, index) => (
        <SectionRow
          key={section.id}
          section={section}
          index={index}
          status={statuses[index]}
          summary={sectionSummary(section, plan)}
        />
      ))}
      {missingDocs?.length ? <p className="note">Still to add: {missingDocs.join(', ')}</p> : null}
      {ready ? null : (
        <p className="small" style={{ marginTop: 6 }}>
          To see results we need: <b>About you</b>, <b>Income and expenses</b>, and <b>Assets</b> or{' '}
          <b>Pension</b>.
        </p>
      )}
    </FlowScreen>
  )
}
