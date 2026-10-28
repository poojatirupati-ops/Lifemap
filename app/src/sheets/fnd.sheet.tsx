import { useMemo } from 'react'
import { foundations, STATUS_LABEL } from '../components/home/foundations.ts'
import { assumption } from '../domain/planning/assumptions.ts'
import { project } from '../domain/planning/project.ts'
import { useStore } from '../state/store.ts'
import CloseButton from './CloseButton.tsx'
import { foundationAction } from './foundationAction.ts'
import SheetTitle from './SheetTitle.tsx'

export const key = 'fnd'

const INK = { color: 'var(--ink)' }

const why = (targetMonths: number) => [
  'Spending less than you earn is what makes every other goal possible. Your spare money each month is what we count towards goals.',
  `An emergency fund is easy-access money for surprises, like a repair or a gap in pay. A common guide is ${targetMonths} months of essential spending.`,
  'Costly debt grows faster than most savings, and protection keeps the plan going if illness or death strikes. Many people sort these out before investing.',
  'With the basics in place, your savings can work towards the things you want and a comfortable retirement.',
  'Once the foundations are solid, investing for the long term can grow your wealth, and you can plan what you leave behind.',
]

/** One foundation level: where it stands, why it matters and the next thing to do. */
export function Body({ param }: { param?: string }) {
  const plan = useStore((store) => store.plan)
  const levels = useMemo(() => foundations(plan, project(plan)), [plan])
  const level = levels[Number(param)]
  if (!level) return null
  const action = foundationAction(level)
  return (
    <>
      <div className="eyebrow">
        Level {level.level} of 5 · {STATUS_LABEL[level.status]}
      </div>
      <SheetTitle>
        {level.emoji} {level.name}
      </SheetTitle>
      <p className="sub" style={INK}>
        <b>{level.text}.</b>
      </p>
      {level.checks && level.checks.length > 1 ? (
        <ul className="small" style={{ margin: '0 0 10px', paddingLeft: 18, ...INK }}>
          {level.checks.map((check) => (
            <li key={check.text}>{check.text}</li>
          ))}
        </ul>
      ) : null}
      {level.status === 'held' ? (
        <p className="sub" style={INK}>
          This level is in place, but a level below it still needs work. Good planning is built from
          the bottom up, so the lower level comes first.
        </p>
      ) : null}
      <p className="sub">{why(assumption(plan, 'safetyMonths'))[level.level - 1]}</p>
      <button className="btn" onClick={action.run}>
        {action.label}
      </button>
      <CloseButton ghost style={{ marginTop: 10 }}>
        Close
      </CloseButton>
      <p className="disc">Guidance, not advice.</p>
    </>
  )
}
