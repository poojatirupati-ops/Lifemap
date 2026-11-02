import { useRef } from 'react'
import { OTHER_GOALS, type OtherGoal } from '../domain/discovery/goals.data.ts'
import { newGoal } from '../domain/goals/goals.ts'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import SheetTitle from './SheetTitle.tsx'
import { addVersion } from '../state/versions.ts'

export const key = 'other'

function addGoal(other: OtherGoal) {
  const { update, closeSheet } = useStore.getState()
  update((plan) => {
    plan.goals.push(newGoal(plan, plan.nextGoalId++, 'other', other))
    if (plan.hasResults) addVersion(plan, 'Goals changed')
  })
  closeSheet()
  toast(`${other.name} added`)
}

function addOwnGoal(name: string) {
  if (!name) toast('Type a name for your goal')
  else addGoal({ emoji: '⭐', name: name.slice(0, 30), amount: 10000, years: 4 })
}

export function Body() {
  const own = useRef<HTMLInputElement>(null)
  return (
    <>
      <SheetTitle>Something else</SheetTitle>
      <p className="sub">Pick one, or name your own.</p>
      <div className="chips">
        {OTHER_GOALS.map((other) => (
          <button className="chip" key={other.name} onClick={() => addGoal(other)}>
            {other.emoji} {other.name}
          </button>
        ))}
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="oth">Name it yourself</label>
        <input
          className="in"
          id="oth"
          maxLength={30}
          placeholder="e.g. Kitchen renovation"
          ref={own}
        />
      </div>
      <button className="btn" onClick={() => addOwnGoal(own.current?.value.trim() ?? '')}>
        Add my goal
      </button>
    </>
  )
}
