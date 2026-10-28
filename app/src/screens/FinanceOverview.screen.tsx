import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import SectionRow from '../components/finance/SectionRow.tsx'
import { backToMe } from '../components/finance/financeActions.ts'
import { startUpload } from '../components/finance/uploadActions.ts'
import { hasMinimumFinances, sectionStatus, sectionSummary } from '../components/finance/status.ts'
import { useFinancePlan } from '../components/finance/useFinancePlan.ts'
import { FINANCE_SECTIONS } from '../domain/finances/sections.data.ts'

export const key = 'P2'
export const id = 'P2'
export const note =
  'Your finances hub: 6 sections, each Upload or Type it. One smart upload at the top. Minimum = About you + Income + Assets or Pension.'

export const Head = () =>
  FlowHead({
    eye: 'Step 3 · Prepare',
    title: 'Your finances',
    sub: 'Add your money once. Rough figures are fine.',
    back: useStore.getState().plan.app ? backToMe : undefined,
  })

// TODO(R-19): R-19 adds missingDocs to the plan type when a failed upload records them
const selectMissingDocs = ({ plan }: { plan: Plan & { missingDocs?: string[] } }) =>
  plan.missingDocs

export function Body() {
  const plan = useFinancePlan()
  const missingDocs = useStore(selectMissingDocs)
  const statuses = FINANCE_SECTIONS.map((section) => sectionStatus(section, plan))
  const done = statuses.filter((status) => status === 'done').length

  return (
    <>
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
          onClick={() => startUpload('smart', ['Sample document.pdf'])}
        >
          Upload
        </button>
      </div>
      <div className="row" style={{ margin: '16px 0 8px', justifyContent: 'space-between' }}>
        <b>{done} of 6 done</b>
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
      {!!missingDocs?.length && <p className="note">Still to add: {missingDocs.join(', ')}</p>}
      {!hasMinimumFinances(plan) && (
        <p className="small" style={{ marginTop: 6 }}>
          To see results we need: <b>About you</b>, <b>Income and expenses</b>, and <b>Assets</b> or{' '}
          <b>Pension</b>.
        </p>
      )}
    </>
  )
}

export function Foot() {
  const inApp = useStore(({ plan }) => plan.app)
  const ready = hasMinimumFinances(useFinancePlan())
  if (inApp) return null
  return (
    <button
      className="btn"
      data-a="go"
      data-p="P4"
      disabled={!ready}
      onClick={() => useStore.getState().go('P4')}
    >
      Check my details
    </button>
  )
}
