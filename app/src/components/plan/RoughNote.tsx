import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import { checkItems, needsAttention, type CheckPlan } from '../finance/checkList.ts'
import { FINANCE_FIELDS } from '../finance/fields.data.ts'
import { fieldSource, skippedSections, visibleFields } from '../finance/status.ts'
import { openMe } from './planActions.ts'

/** Required figures nobody has entered yet. */
const blankFigures = (plan: CheckPlan) =>
  FINANCE_SECTIONS.flatMap((section) => visibleFields(section, plan)).filter(
    (key) => !FINANCE_FIELDS[key].optional && !fieldSource(key, plan),
  ).length

const listed = (names: string[]) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]

/** Rough picture: skipped sections or more than two blank figures count as €0. */
export default function RoughNote({ plan }: { plan: CheckPlan }) {
  const skipped = skippedSections(plan)
  // one banner, not two: the missing-details banner already says the picture is rough
  if (!skipped.length && blankFigures(plan) <= 2) return null
  if (checkItems(plan).some(needsAttention)) return null

  const money = skipped.filter((section) => section.id !== 'prot').map((section) => section.title)
  const many = money.length > 1
  const message =
    (money.length
      ? `${listed(money)}${many ? ' are' : ' is'} missing, so ${many ? 'they count' : 'it counts'} as €0. `
      : '') +
    (skipped.some((section) => section.id === 'prot')
      ? "Your protection cover isn't added yet. "
      : '') +
    (skipped.length ? '' : 'Some figures are missing, so they count as €0. ')

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
        <b>Rough picture.</b> {message}
        {skipped.length === 1 ? 'Add it' : 'Add them'} to sharpen your plan.
      </span>
      <button className="link" data-a="me" data-p="money" onClick={() => openMe('money')}>
        Add now
      </button>
    </div>
  )
}
