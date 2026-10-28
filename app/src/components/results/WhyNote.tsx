import { useMemo } from 'react'
import type { project } from '../../domain/planning/project'
import { planSettings, type ProjectionInputs } from '../../domain/planning/planSettings'
import { HOLDINGS } from '../../domain/planning/wallet'
import { euro } from '../../lib/format'
import type { Goal } from '../../state/types'

interface Props {
  plan: ProjectionInputs
  projection: ReturnType<typeof project>
  goal: Goal
}

const HOLDING_NAMES: Record<(typeof HOLDINGS)[number], string> = {
  cash: 'cash',
  savings: 'savings accounts',
  invest: 'investments',
  otherAssets: 'other assets',
  alternatives: 'alternative investments',
}

const years = (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`

/** Where a goal's money comes from, and what is still to find. */
export default function WhyNote({ plan, projection, goal }: Props) {
  const figures = useMemo(() => planSettings(plan).figures, [plan])
  const funding = projection.goals[goal.id]
  if (!funding || goal.kind === 'retire' || goal.kind === 'legacy') return null

  const fromHoldings = (amounts: Partial<Record<string, number>>, when: string) =>
    HOLDINGS.filter((key) => (amounts[key] ?? 0) > 0.5).map(
      (key) => `${euro(amounts[key]!)} from your ${HOLDING_NAMES[key]} ${when}`,
    )
  const parts = [
    ...(funding.savedSoFar > 0 ? [`${euro(funding.savedSoFar)} already saved`] : []),
    ...fromHoldings(funding.fromAssets, 'today'),
    ...(funding.averageMonthly > 0
      ? [
          `about ${euro(funding.averageMonthly)} a month from your pay` +
            (funding.years > 0 ? ` for ${years(funding.years)}` : ''),
        ]
      : []),
    ...fromHoldings(funding.fromAssetsWhenDue, 'when it is due'),
  ]
  const covered = projection.percent[goal.id]
  let text = parts.length ? `${parts.join(' + ')}, plus growth: ${covered}% covered.` : ''
  if (funding.gap > 1 && covered < 100) {
    text += ` Still to find: ${euro(funding.gap)}${goal.kind !== 'pot' ? ' (in future euros)' : ''}.`
    if (figures.homeUse === 'Only as a last resort' && figures.homeValue > 0) {
      const released = Math.round(figures.homeValue * 0.5 * 0.9)
      text +=
        ` If you downsized at 70 to a home worth half as much, you'd free about ${euro(released)} in today's money` +
        (released >= funding.gap ? ', which would close this gap.' : '.')
    }
  }
  if (!text) return null
  return (
    <div className="gl" style={{ opacity: 0.85 }}>
      {text}
    </div>
  )
}
