import type { MoneyProfileStep } from '../../domain/discovery/questions.data.ts'
import GIcon from '../ui/GIcon.tsx'
import { answerOf, profileQuestion } from '../define/profileActions.ts'
import { openProfileSection } from './meActions.ts'
import { useMePlan } from './mePlan.ts'

const STATUS_WORD = { done: 'Done', part: 'In progress', none: 'Not started' }

/** One of the money profile's three sections, with how far along it is. */
export default function ProfileSectionButton({ section }: { section: MoneyProfileStep }) {
  const total = section.questions.length
  const answered = useMePlan(
    (plan) =>
      section.questions.filter((entry) => answerOf(plan, profileQuestion(entry)) != null).length,
  )
  const done = useMePlan((plan) => !!plan.um.done[section.step])
  const status = done ? 'done' : answered ? 'part' : 'none'

  return (
    <button
      className={`ump-s ${status}`}
      data-a="umsec"
      data-p={section.step}
      onClick={() => openProfileSection(section.step)}
    >
      <GIcon emoji={section.emoji} className="ump-e" aria-hidden="true" />
      <span className="ump-m">
        <small>{section.term}</small>
        <b>{section.title}</b>
        <span className="ump-sb">
          <i style={{ width: `${Math.round((answered / total) * 100)}%` }}></i>
        </span>
        <em>
          {answered} of {total} answered
        </em>
      </span>
      <span className="ump-st">{done ? '✓ Done' : answered === total ? 'Review' : 'Continue'}</span>
      <span className="sr">{STATUS_WORD[status]}</span>
    </button>
  )
}
