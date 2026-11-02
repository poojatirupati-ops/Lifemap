import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import Emo from '../ui/Emo.tsx'
import Stepper from './Stepper.tsx'
import SafetyMonths from './SafetyMonths.tsx'
import GoalDetails from './GoalDetails.tsx'
import TrashIcon from './TrashIcon.tsx'
import { commitOnBlur } from './commitOnBlur.ts'
import { whenText } from '../../domain/goals/goalTiming.ts'
import { useTiming } from '../../hooks/useTiming.ts'
import type { Goal } from '../../state/types.ts'

const AMOUNT_LABEL: Record<string, string> = {
  retire: 'Income a year €',
  mfree: 'Mortgage left €',
}

/** One goal's editable row under the timeline. */
export default function GoalRow({ goal }: { goal: Goal }) {
  const timing = useTiming()
  const highlighted = useStore((store) => store.plan.highlightedGoal === goal.id)
  const open = useStore((store) => !!store.plan.timelineOpen[goal.id])
  const fromLiabilities = useStore((store) => goal.kind === 'mfree' && !!store.plan.figures.mortBal)
  const moveGoal = useStore((store) => store.moveGoal)
  const removeGoal = useStore((store) => store.removeGoal)
  const renameGoal = useStore((store) => store.renameGoal)
  const setGoalAmount = useStore((store) => store.setGoalAmount)
  const setGoalSaved = useStore((store) => store.setGoalSaved)
  const toggleDetails = useStore((store) => store.toggleDetails)
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
            <TrashIcon />
          </button>
        )}
      </div>
      <div className="flds">
        <div className="full">
          <span className="fl">{retire ? 'Retire at' : 'When'}</span>
          <Stepper label="When" onStep={(by) => moveGoal(goal.id, goal.age + by)}>
            <span id={`when-${goal.id}`}>{whenText(timing, goal)}</span>
          </Stepper>
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
      {!retire && open && <GoalDetails goal={goal} />}
    </div>
  )
}
