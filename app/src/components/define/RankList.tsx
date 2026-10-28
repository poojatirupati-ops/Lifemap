import { useState, type CSSProperties } from 'react'
import { fundingOrder } from '../../domain/planning/fund.ts'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import { goalYear } from './goalWhen.ts'
import { moveGoal, resetRank } from './goalActions.ts'
import { rankGoal } from '../plan/planActions.ts'
import { useRankDrag } from '../../hooks/useRankDrag.ts'

const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
}

/**
 * "Which goal first?": savings go to the top goal first. `place` is 'f4' or 'plan' (no card, hidden heading).
 * Rows drag to reorder (useRankDrag); the arrow buttons do the same from the keyboard.
 */
export default function RankList({ place }: { place: 'f4' | 'plan' }) {
  const plan = useStore(
    useShallow(({ plan }) => ({
      goals: plan.goals,
      rank: plan.rank,
      about: plan.about,
      asm: plan.asm,
      fin: plan.fin,
      retireSet: plan.retireSet,
    })),
  )
  const [status, setStatus] = useState('')
  const dragHandlers = useRankDrag((from, to) => setStatus(rankGoal(from, to)))
  const goals = fundingOrder(plan.goals, plan.rank)
  if (goals.length < 2) return null

  const move = (id: number, step: -1 | 1) => setStatus(moveGoal(id, step) ?? status)
  const inPlan = place === 'plan'
  const headingStyle = { margin: '0 0 2px', ...(inPlan && VISUALLY_HIDDEN) }

  return (
    <div className={inPlan ? undefined : 'card'} id={`rank-${place}`}>
      <h3 className="h" style={headingStyle} id={`rank-h-${place}`}>
        Which goal first?
      </h3>
      <p className="small" style={{ margin: '0 0 8px' }}>
        Savings go to the top goal first. Drag a goal to reorder.
      </p>
      <ol
        className="rank"
        aria-labelledby={`rank-h-${place}`}
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
        {...dragHandlers}
      >
        {goals.map((goal, index) => {
          const when =
            goal.kind === 'retire'
              ? 'Paid from your pension'
              : goal.kind === 'legacy'
                ? 'What is left at the end'
                : `${goalYear(goal, plan)} · age ${goal.age}`
          const position = `now ${index + 1} of ${goals.length}`
          return (
            <li
              key={goal.id}
              className="mini rk-r"
              data-gid={goal.id}
              style={{ alignItems: 'center' }}
            >
              <span className="rk-grip" aria-hidden="true" title="Drag to reorder">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span className="rk-n">{index + 1}</span>
              <GIcon emoji={goal.e} className="rk-e" aria-hidden="true" />
              <span style={{ flex: 1, minWidth: 0 }}>
                <b className="rk-t">{goal.name}</b>
                <span className="small">{when}</span>
              </span>
              <span className="rk-arr">
                <button
                  className="chip sm"
                  data-a="grank"
                  data-p={`${goal.id}|up`}
                  aria-label={`Move ${goal.name} up, ${position}`}
                  aria-disabled={index === 0 || undefined}
                  onClick={() => move(goal.id, -1)}
                >
                  ▲
                </button>
                <button
                  className="chip sm"
                  data-a="grank"
                  data-p={`${goal.id}|down`}
                  aria-label={`Move ${goal.name} down, ${position}`}
                  aria-disabled={index === goals.length - 1 || undefined}
                  onClick={() => move(goal.id, 1)}
                >
                  ▼
                </button>
              </span>
            </li>
          )
        })}
      </ol>
      <p className="small" role="status" id={`rank-msg-${place}`} style={{ margin: '6px 0 0' }}>
        {status}
      </p>
      {plan.rank && (
        <button className="link" data-a="grankreset" onClick={() => setStatus(resetRank())}>
          Back to our suggested order
        </button>
      )}
    </div>
  )
}
