import { useStore } from '../state/store.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import CheckRow from '../components/finance/CheckRow.tsx'
import FieldTag from '../components/finance/FieldTag.tsx'
import RequiredChoices from '../components/finance/RequiredChoices.tsx'
import SkippedSectionRow from '../components/finance/SkippedSectionRow.tsx'
import {
  checkItems,
  isSectionLeftForAdviser,
  itemNote,
  needsAttention,
  withLooks,
  workedOutNote,
} from '../components/finance/checkList.ts'
import { FINANCE_FIELDS } from '../domain/finances/fields.data.ts'
import { seeResults, skipResults } from '../components/finance/financeActions.ts'
import { missingChoices } from '../components/finance/requiredChoices.ts'
import { formatField, skippedSections } from '../components/finance/status.ts'
import { useFinancePlan } from '../components/finance/useFinancePlan.ts'
import { FINANCE_SECTIONS } from '../domain/finances/sections.data.ts'

export const key = 'P4'
export const id = 'P4'
export const note =
  'Data-gap review: one row per skipped section; single rows only for ❓ / ⚠️ items in partly filled sections. Step 7 is skippable (§22): choose 3 things, optional standards for the rest, then See my results or Skip.'

// Head is hook-free (called as a function); ScreenHost re-renders it on every plan change.
export const Head = () => {
  const { plan } = useStore.getState()
  const anyFlagged = checkItems(withLooks(plan)).some(needsAttention)
  return FlowHead({
    eye: 'Step 3 · Prepare',
    title: 'Check your details',
    sub: anyFlagged
      ? 'Only the items worth a second look are shown.'
      : 'Everything looks complete.',
    back: () => useStore.getState().go('P2'),
  })
}

export function Body() {
  const plan = useFinancePlan()
  const items = checkItems(plan)
  const flagged = items.filter(needsAttention)
  const good = items.filter((item) => !needsAttention(item))
  const skipped = skippedSections(plan)
  const single = flagged.filter((item) => !skipped.includes(item.section))

  return (
    <>
      <RequiredChoices />
      {flagged.length > 0 ? (
        <div className="card" style={{ marginTop: 12 }}>
          {skipped.map((section) => (
            <SkippedSectionRow
              key={section.id}
              section={section}
              index={FINANCE_SECTIONS.indexOf(section)}
              leftForAdviser={isSectionLeftForAdviser(section, plan)}
            />
          ))}
          {single.map((item) => (
            <CheckRow
              key={item.key}
              item={item}
              index={FINANCE_SECTIONS.indexOf(item.section)}
              status={itemNote(item, plan)}
              workedOut={workedOutNote(item.key, plan)}
              leftForAdviser={!!plan.acknowledged[item.key]}
            />
          ))}
        </div>
      ) : null}
      <details className="card" style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>
          ✅ {good.length} details look good
        </summary>
        {good.map((item) => (
          <div className="mini" key={item.key}>
            <span>{FINANCE_FIELDS[item.key].label}</span>
            <span>
              {formatField(item.key, plan)} <FieldTag field={item.key} />
            </span>
          </div>
        ))}
      </details>
    </>
  )
}

export function Foot() {
  const nextChoice = useStore(({ plan }) => missingChoices(plan)[0]?.name)
  return (
    <>
      {nextChoice ? (
        <p className="small" style={{ margin: 0, textAlign: 'center' }} id="p4-need">
          Choose your {nextChoice} above to see your results.
        </p>
      ) : null}
      <button
        className="btn"
        data-a="toresults"
        id="seeres"
        disabled={!!nextChoice}
        onClick={seeResults}
      >
        See my results
      </button>
      <button
        className="link p4-skip"
        data-a="skipres"
        id="skipres"
        disabled={!!nextChoice}
        onClick={skipResults}
      >
        Skip this step
      </button>
    </>
  )
}
