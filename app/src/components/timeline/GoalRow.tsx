import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import Emo from '../ui/Emo.tsx'
import Stepper from './Stepper.tsx'
import SafetyMonths from './SafetyMonths.tsx'
import GoalDetails from './GoalDetails.tsx'
import TrashIcon from './TrashIcon.tsx'
import { useTiming, whenText } from './goalText.ts'
import {
  moveGoal,
  removeGoal,
  renameGoal,
  setGoalAmount,
  setGoalSaved,
  toggleDetails,
} from './goalActions.ts'
import type { Goal } from '../../state/types.ts'

/** Commit a typed figure when the field is left, as the original's change event did. */
const onCommit =
  (save: (typed: string) => void) => (event: { currentTarget: HTMLInputElement }) => {
    const input = event.currentTarget
    if (input.value !== input.defaultValue) save(input.value)
  }

/** One goal's editable row under the timeline. */
export default function GoalRow({ goal }: { goal: Goal }) {
  const timing = useTiming()
  const highlighted = useStore((store) => store.plan.tlHl === goal.id)
  const open = useStore((store) => !!store.plan.tlOpen[goal.id])
  const fromLiabilities = useStore((store) => goal.kind === 'mfree' && !!store.plan.fin.mortBal)
  const retire = goal.kind === 'retire'
  const amountLabel = retire
    ? 'Income a year €'
    : goal.kind === 'mfree'
      ? 'Mortgage left €'
      : 'Amount €'

  return (
    <div className={highlighted ? 'grow hl' : 'grow'} id={`row-${goal.id}`}>
      <div className="hd">
        <GIcon className="e" emoji={goal.e} aria-hidden="true" />
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
          <span className="fl">{amountLabel}</span>
          <input
            key={goal.amount}
            className="in"
            inputMode="numeric"
            defaultValue={Math.round(goal.amount)}
            onBlur={onCommit((typed) => setGoalAmount(goal.id, typed))}
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
              onBlur={onCommit((typed) => setGoalSaved(goal.id, typed))}
            />
          </label>
        )}
        {goal.k === 'safety' && <SafetyMonths goal={goal} />}
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
