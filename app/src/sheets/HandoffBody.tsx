import type { Handoff } from '../components/calc/types.ts'
import InflationChoice from '../components/finance/InflationChoice.tsx'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import CloseButton from './CloseButton.tsx'
import { applyHandoff, buttonFor, describeHandoff } from './handoff.ts'
import SheetTitle from './SheetTitle.tsx'

function addToPlan(goal: Handoff) {
  const { update, closeSheet } = useStore.getState()
  let message = ''
  update((plan) => {
    message = applyHandoff(plan, goal)
    if (plan.app) plan.versions.push({ note: 'Goals changed', date: '29 Sep 2026' })
  })
  closeSheet()
  toast(message)
}

/** "Add to my plan": nothing to add, inflation needed first, or what would be added. */
export default function HandoffBody({ toolId, goal }: { toolId: string; goal: Handoff | null }) {
  const age = useStore((store) => store.plan.about.age ?? 0)
  const app = useStore((store) => store.plan.app)
  if (!goal)
    return (
      <>
        <SheetTitle>Nothing to add</SheetTitle>
        <p className="sub">
          This result doesn't create a goal
          {toolId === 'debtpay' ? ': your plan already repays this debt.' : '.'}
        </p>
        <CloseButton>OK</CloseButton>
      </>
    )
  if (goal.kind === 'blocked')
    return (
      <>
        <SheetTitle>{goal.msg}</SheetTitle>
        <p className="sub">
          Goals are kept in today's money, so we need your inflation rate first.
        </p>
        <InflationChoice place="add" />
        <CloseButton style={{ marginTop: 10 }}>OK</CloseButton>
      </>
    )
  const saves = app
    ? 'This saves a new version of your plan.'
    : 'It will be on your timeline when you make your plan.'
  return (
    <>
      <div className="eyebrow">Add to my plan</div>
      <SheetTitle>
        {goal.em} {goal.name}
      </SheetTitle>
      <p className="sub">
        {describeHandoff(goal, age)} {saves}
      </p>
      <button className="btn" onClick={() => addToPlan(goal)}>
        {buttonFor(goal)}
      </button>
      <CloseButton ghost style={{ marginTop: 10 }}>
        Not now
      </CloseButton>
    </>
  )
}
