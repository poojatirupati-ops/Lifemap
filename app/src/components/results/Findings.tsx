import { livingShort, type project } from '../../domain/planning/project'
import type { ProjectionInputs } from '../../domain/planning/planSettings'
import { extraNeededFor } from '../../domain/planning/wi'
import { euro } from '../../lib/format'
import { useStore } from '../../state/store'
import type { Goal } from '../../state/types'
import Emo from '../ui/Emo'

interface Props {
  plan: ProjectionInputs & { fin: Record<string, unknown> }
  /** the plan without any what-if */
  projection: ReturnType<typeof project>
}

/** Strength, gap and decision, from the plan as it stands. */
function findings({ plan, projection: { rows, percent } }: Props) {
  const goals = plan.goals
  const byAge = (a: Goal, b: Goal) => a.age - b.age
  const worst = goals.slice().sort((a, b) => percent[a.id] - percent[b.id] || byAge(a, b))[0]
  // a strength is only a fully covered goal, and never while working years spend more than comes in
  const overspending = rows.some((row) => !row.retired && livingShort(row))
  const best = overspending
    ? null
    : goals
        .filter((goal) => percent[goal.id] >= 95)
        .sort((a, b) => percent[b.id] - percent[a.id] || byAge(a, b))[0]

  const strength = best
    ? best.kind === 'retire'
      ? `Your pension and savings cover retiring at ${best.age}`
      : `${best.name} is ${percent[best.id]}% covered`
    : overspending
      ? 'No strength to point to yet: your spending is more than comes in'
      : 'Nothing is fully covered yet, so closing the gap comes first'
  if (percent[worst.id] >= 95) {
    const unprotected = plan.fin.life !== 'Yes' || plan.fin.ip !== 'Yes'
    return {
      str: strength,
      gap: 'No big gaps right now',
      dec: unprotected
        ? 'Worth a look: would your plan cope with illness or death? An adviser can check your cover with you'
        : 'A yearly review keeps it on track',
    }
  }
  const extra = extraNeededFor(plan, worst)
  return {
    str: strength,
    gap: `${worst.name} is ${percent[worst.id]}% covered`,
    dec: extra
      ? `Saving about ${euro(extra)} more a month could close this gap, on our assumptions`
      : `Moving ${worst.name.toLowerCase()} later, or changing the amount, would make the biggest difference`,
  }
}

const CARDS = [
  { key: 'str', icon: '💪', label: 'Your main strength' },
  { key: 'gap', icon: '🔎', label: 'Your main gap' },
  { key: 'dec', icon: '🎯', label: 'Your biggest decision' },
] as const

/** What we found: three cards, each opening its explanation. */
export default function Findings(props: Props) {
  const openSheet = useStore((store) => store.openSheet)
  const found = findings(props)
  return (
    <div className="found" style={{ marginTop: 8 }}>
      {CARDS.map(({ key, icon, label }) => (
        <button
          key={key}
          className={`fcard f2c ${key}`}
          onClick={() => openSheet(`explain|${key}`)}
        >
          <span className="f2c-i" aria-hidden="true">
            {icon}
          </span>
          <span className="f2c-m">
            <small>{label}</small>
            <b>
              <Emo>{found[key]}</Emo>
            </b>
          </span>
          <span className="f2c-go" aria-hidden="true">
            ›
          </span>
        </button>
      ))}
    </div>
  )
}
