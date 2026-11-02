// What we found: the plan's main strength, its main gap and the biggest decision.
import type { Goal } from '../../state/types'
import { euro } from '../../lib/format'
import type { ProjectionInputs } from './planSettings'
import { livingShort, type YearRow } from './project'
import { extraNeededFor } from './wi'

export interface Protection {
  life?: string
  ip?: string
}
type Year = Pick<YearRow, 'retired' | 'livingShortfall' | 'needs'>

const ON_TRACK = 95

function strengthText(best: (Goal & { covered: number }) | undefined, overspending: boolean) {
  if (best?.kind === 'retire') return `Your pension and savings cover retiring at ${best.age}`
  if (best) return `${best.name} is ${best.covered}% covered`
  if (overspending) return 'No strength to point to yet: your spending is more than comes in'
  return 'Nothing is fully covered yet, so closing the gap comes first'
}

/** Strength, gap and decision, from the plan as it stands (no what-if). */
export function findings(
  plan: ProjectionInputs & { figures: Protection },
  rows: Year[],
  percent: Record<number, number>,
) {
  const covered = (goal: Goal) => percent[goal.id]
  const worst = plan.goals.toSorted((a, b) => covered(a) - covered(b) || a.age - b.age)[0]
  // a strength is only a fully covered goal, and never while working years spend more than comes in
  const overspending = rows.some((row) => !row.retired && livingShort(row))
  const best = overspending
    ? undefined
    : plan.goals
        .filter((goal) => covered(goal) >= ON_TRACK)
        .toSorted((a, b) => covered(b) - covered(a) || a.age - b.age)[0]

  const strength = strengthText(best && { ...best, covered: covered(best) }, overspending)
  // said after the strength: why we call it one (or don't)
  const strengthWhy = best
    ? 'Of all your goals, this one is the best covered by your future income, savings and pension.'
    : 'We only call something a strength when a goal is fully covered and your everyday spending is paid for.'

  if (covered(worst) >= ON_TRACK) {
    const unprotected = plan.figures.life !== 'Yes' || plan.figures.ip !== 'Yes'
    return {
      worst,
      strength,
      strengthWhy,
      gap: 'No big gaps right now',
      decision: unprotected
        ? 'Worth a look: would your plan cope with illness or death? An adviser can check your cover with you'
        : 'A yearly review keeps it on track',
    }
  }
  const extra = extraNeededFor(plan, worst)
  return {
    worst,
    strength,
    strengthWhy,
    gap: `${worst.name} is ${covered(worst)}% covered`,
    decision: extra
      ? `Saving about ${euro(extra)} more a month could close this gap, on our assumptions`
      : `Moving ${worst.name.toLowerCase()} later, or changing the amount, would make the biggest difference`,
  }
}
