import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { makePlan } from '../state/plan.ts'
import { STATUS_LABEL, type Foundation } from '../domain/planning/foundationCheck.ts'
import { foundations } from '../domain/planning/foundations.ts'
import { assumption } from '../domain/planning/assumptions.ts'
import { useProjection } from '../hooks/useProjection.ts'
import { openCalculator, talkToExpert } from '../state/explore.ts'
import { useStore } from '../state/store.ts'
import CloseButton from './CloseButton.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'fnd'

const INK = { color: 'var(--ink)' }

/** Why each level matters, by level number; level 2 quotes the emergency-fund target. */
const WHY: Record<number, (targetMonths: number) => string> = {
  1: () =>
    'Spending less than you earn is what makes every other goal possible. Your spare money each month is what we count towards goals.',
  2: (targetMonths) =>
    `An emergency fund is easy-access money for surprises, like a repair or a gap in pay. A common guide is ${targetMonths} months of essential spending.`,
  3: () =>
    'Costly debt grows faster than most savings, and protection keeps the plan going if illness or death strikes. Many people sort these out before investing.',
  4: () =>
    'With the basics in place, your savings can work towards the things you want and a comfortable retirement.',
  5: () =>
    'Once the foundations are solid, investing for the long term can grow your wealth, and you can plan what you leave behind.',
}

const TOOL_NAMES: Record<string, string> = {
  debtpay: 'Open Debt repayment',
  lifecover: 'Open the Life cover tool',
}

/** The one button that helps most with this level. */
function actionFor(level: Foundation): { label: string; run: () => void } {
  const { tryWhatIf, openSection } = useStore.getState()
  if (level.status === 'na')
    return level.makePlan
      ? { label: 'Make my plan', run: makePlan }
      : { label: 'Add it now', run: () => openSection(level.section ?? 0) }
  const { tool } = level
  switch (level.level) {
    case 1:
      return { label: 'Open the Monthly surplus calculator', run: () => openCalculator('surplus') }
    case 2:
      return { label: 'Open the Emergency fund calculator', run: () => openCalculator('emergency') }
    case 3:
      if (!tool)
        return { label: 'Talk to a protection expert', run: () => talkToExpert('protection') }
      return {
        label: TOOL_NAMES[tool] ?? 'Open Income protection gap',
        run: () => openCalculator(tool),
      }
    case 4:
      return { label: 'Try a what-if', run: () => tryWhatIf() }
    default:
      return { label: 'Talk to an investment expert', run: () => talkToExpert('investment') }
  }
}

/** One foundation level: where it stands, why it matters and the next thing to do. */
export function Body({ param }: { param?: string }) {
  const { inputs, base } = useProjection()
  const rest = useStore(
    useShallow(({ plan }) => ({
      lists: plan.lists,
      moneyProfile: plan.moneyProfile,
      hasResults: plan.hasResults,
    })),
  )
  const levels = useMemo(() => foundations({ ...inputs, ...rest }, base), [inputs, rest, base])
  const level = levels[Number(param)]
  if (!level) return null
  const action = actionFor(level)
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
      <p className="sub">{WHY[level.level](assumption(inputs, 'safetyMonths'))}</p>
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
