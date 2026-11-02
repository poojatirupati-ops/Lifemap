import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import { useCheckPlan } from '../../hooks/useCheckPlan.ts'
import { useStore } from '../../state/store.ts'
import { checkItems, needsAttention, type CheckPlan } from '../finance/checkList.ts'
import { FINANCE_FIELDS } from '../../domain/finances/fields.data.ts'
import { fieldSource, skippedSections, visibleFields } from '../finance/status.ts'

/** Required figures nobody has entered yet. */
const blankFigureCount = (plan: CheckPlan) =>
  FINANCE_SECTIONS.flatMap((section) => visibleFields(section, plan)).filter(
    (key) => !FINANCE_FIELDS[key].optional && !fieldSource(key, plan),
  ).length

const listed = (names: string[]) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]

/** What is missing, one sentence each. */
function missingSentences(skipped: { id: string; title: string }[]) {
  if (!skipped.length) return ['Some figures are missing, so they count as €0.']
  const money = skipped.filter((section) => section.id !== 'prot').map((section) => section.title)
  const sentences = []
  if (money.length === 1) sentences.push(`${money[0]} is missing, so it counts as €0.`)
  if (money.length > 1) sentences.push(`${listed(money)} are missing, so they count as €0.`)
  if (money.length < skipped.length) sentences.push("Your protection cover isn't added yet.")
  return sentences
}

/** Rough picture: skipped sections or more than two blank figures count as €0. */
export default function RoughNote() {
  const plan = useCheckPlan()
  const openMe = useStore((store) => store.openMe)
  const skipped = skippedSections(plan)
  if (!skipped.length && blankFigureCount(plan) <= 2) return null
  // one banner, not two: the missing-details banner already says the picture is rough
  if (checkItems(plan).some(needsAttention)) return null

  return (
    <div
      className="nudge"
      id="r-rough"
      style={{ background: 'var(--sun-l)', border: '1.5px solid var(--sun)' }}
    >
      <span aria-hidden="true" style={{ fontSize: 20 }}>
        🧩
      </span>
      <span>
        <b>Rough picture.</b> {missingSentences(skipped).join(' ')}{' '}
        {skipped.length === 1 ? 'Add it' : 'Add them'} to sharpen your plan.
      </span>
      <button className="link" data-a="me" data-p="money" onClick={() => openMe('money')}>
        Add now
      </button>
    </div>
  )
}
