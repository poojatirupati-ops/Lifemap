import { Fragment, type FocusEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cushion } from '../../domain/discovery/cushion.ts'
import { whenText } from '../../domain/goals/goalTiming.ts'
import { essentialSpending } from '../../domain/goals/goals.ts'
import { assumption, chosenAssumption } from '../../domain/planning/assumptions.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import { euro, plural } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import type { Goal } from '../../state/types.ts'
import Emo from '../ui/Emo.tsx'
import GIcon from '../ui/GIcon.tsx'
import { useFigures } from '../../hooks/useFigures.ts'

const AMOUNT_LABEL: Record<string, string> = {
  retire: 'Income a year €',
  mfree: 'Mortgage left €',
}

const DETAILS = [
  { field: 'who', label: 'For whom', options: ['Me', 'Partner', 'Child', 'Family'] },
  { field: 'flex', label: 'Flexible on timing?', options: ['Can move', 'Fixed date'] },
] as const

const trashIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
)

/** Save a typed figure when the field is left, only if it changed. */
const commitOnBlur =
  (save: (typed: string) => void) =>
  ({ currentTarget: input }: FocusEvent<HTMLInputElement>) => {
    if (input.value !== input.defaultValue) save(input.value)
  }

/** One goal's editable row under the timeline. */
export default function GoalRow({ goal }: { goal: Goal }) {
  const timing = useTiming()
  const highlighted = useStore((store) => store.highlightedGoal === goal.id)
  const open = useStore((store) => !!store.timelineOpen[goal.id])
  const fromLiabilities = useStore((store) => goal.kind === 'mfree' && !!store.plan.figures.mortBal)
  const { moveGoal, removeGoal, renameGoal, setGoalAmount, setGoalSaved } = useStore.getState()
  const { setGoalDetail, toggleDetails } = useStore.getState()
  const retire = goal.kind === 'retire'

  return (
    <div className={highlighted ? 'grow hl' : 'grow'} id={`row-${goal.id}`}>
      <div className="hd">
        <GIcon className="e" emoji={goal.emoji} aria-hidden="true" />
        <input
          defaultValue={goal.name}
          aria-label="Goal name"
          readOnly={retire}
          onInput={(event) => renameGoal(goal.id, event.currentTarget.value)}
        />
        {!retire && (
          <button
            className="gdel2"
            aria-label={`Remove ${goal.name}`}
            title="Remove"
            onClick={() => removeGoal(goal.id)}
          >
            {trashIcon}
          </button>
        )}
      </div>
      <div className="flds">
        <div className="full">
          <span className="fl">{retire ? 'Retire at' : 'When'}</span>
          <div className="stepper" role="group" aria-label="When">
            <button aria-label="Less" onClick={() => moveGoal(goal.id, goal.age - 1)}>
              −
            </button>
            <output aria-live="polite">
              <span id={`when-${goal.id}`}>{whenText(timing, goal)}</span>
            </output>
            <button aria-label="More" onClick={() => moveGoal(goal.id, goal.age + 1)}>
              +
            </button>
          </div>
        </div>
        <label>
          <span className="fl">{AMOUNT_LABEL[goal.kind] ?? 'Amount €'}</span>
          <input
            key={goal.amount}
            className="in"
            inputMode="numeric"
            defaultValue={Math.round(goal.amount)}
            onBlur={commitOnBlur((typed) => setGoalAmount(goal.id, typed))}
          />
        </label>
        {retire ? (
          <div>
            <span className="fl">Pension</span>
            <span className="small">From Your finances</span>
          </div>
        ) : (
          <label>
            <span className="fl">Saved so far €</span>
            <input
              key={goal.saved}
              className="in"
              inputMode="numeric"
              defaultValue={Math.round(goal.saved || 0)}
              onBlur={commitOnBlur((typed) => setGoalSaved(goal.id, typed))}
            />
          </label>
        )}
        {goal.key === 'safety' && <SafetyMonths goal={goal} />}
      </div>
      <div className="gr-foot">
        <span className="gr-tm">
          {`Today's money${fromLiabilities ? ' · from your Liabilities' : ''}`}
        </span>
        {!retire && (
          <button className="gr-more" aria-expanded={open} onClick={() => toggleDetails(goal.id)}>
            <Emo>{open ? 'Fewer details ↑' : 'More details ↓'}</Emo>
          </button>
        )}
      </div>
      {!retire && open && (
        <div className="more">
          {DETAILS.map(({ field, label, options }) => (
            <Fragment key={field}>
              <div className="fl" style={{ marginTop: 6 }}>
                {label}
              </div>
              <div className="chips">
                {options.map((option) => (
                  <button
                    key={option}
                    className={goal[field] === option ? 'chip sm sel' : 'chip sm'}
                    aria-pressed={goal[field] === option}
                    onClick={() => setGoalDetail(goal.id, field, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The emergency fund's months of essential spending (blank follows the standard), how many months
 * its amount covers, and why it was added.
 */
function SafetyMonths({ goal }: { goal: Goal }) {
  useFigures()
  const chosen = useStore((store) => chosenAssumption(store.plan.assumptions, 'safetyMonths'))
  const suggested = useStore((store) =>
    assumption({ ...store.plan, assumptions: {} }, 'safetyMonths'),
  )
  const household = useStore(
    useShallow(({ plan }) => ({
      about: plan.about,
      figures: plan.figures,
      assumptions: plan.assumptions,
      sources: plan.sources,
      answers: plan.answers,
      retireAge: plan.retireAge,
    })),
  )
  const spending = essentialSpending(household)
  const { months: covered, targetMonths } = cushion(household)
  const why = goal.autoAdded
    ? `Added because your cash covers ${covered} of ${targetMonths} months. An emergency fund comes before other goals. You can remove it. `
    : ''
  const months = Math.round((goal.amount / spending) * 10) / 10

  return (
    <label className="full">
      <span className="fl">Months of essential spending to keep</span>
      <input
        key={chosen ?? ''}
        className="in"
        inputMode="numeric"
        defaultValue={chosen ?? ''}
        placeholder={`e.g. ${suggested}`}
        onBlur={commitOnBlur(useStore.getState().setSafetyMonths)}
      />
      {spending > 0 && goal.amount > 0 ? (
        <span className="small" style={{ display: 'block' }} id={`sf-note-${goal.id}`}>
          {why}
          {`${euro(goal.amount)} is about ${plural(months, 'month')} of your essential spending (${euro(spending)} a month).`}
        </span>
      ) : null}
    </label>
  )
}
