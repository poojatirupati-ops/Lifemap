// Why a goal is covered as it is: where its money comes from, and what is still to find.
import { euro } from '../../lib/format'
import type { Goal } from '../../state/types'
import type { GoalFunding } from './fund'
import { HOLDINGS, type Holding } from './wallet'

const HOLDING_NAMES: Record<Holding, string> = {
  cash: 'cash',
  savings: 'savings accounts',
  invest: 'investments',
  otherAssets: 'other assets',
  alternatives: 'alternative investments',
}
/** Downsizing at 70 to a home worth half as much... */
const HALF_VALUE_HOME = 0.5
/** ...keeps 90% of what it frees once selling and moving are paid. */
const AFTER_COSTS = 0.9

const years = (count: number) => `${count} ${count === 1 ? 'year' : 'years'}`

/** "€X from your savings accounts today", one per holding that pays in. */
const fromHoldings = (amounts: Partial<Record<Holding, number>>, when: string) =>
  HOLDINGS.flatMap((key) => {
    const amount = amounts[key] ?? 0
    return amount > 0.5 ? [`${euro(amount)} from your ${HOLDING_NAMES[key]} ${when}`] : []
  })

interface WhyInputs {
  funding: GoalFunding
  covered: number
  goalKind: Goal['kind']
  homeValue: number
  homeUse: string
}

export function whyNoteText({ funding, covered, goalKind, homeValue, homeUse }: WhyInputs) {
  const fromPay = `about ${euro(funding.averageMonthly)} a month from your pay`
  const sources = [
    funding.savedSoFar > 0 ? [`${euro(funding.savedSoFar)} already saved`] : [],
    fromHoldings(funding.fromAssets, 'today'),
    funding.averageMonthly > 0
      ? [funding.years > 0 ? `${fromPay} for ${years(funding.years)}` : fromPay]
      : [],
    fromHoldings(funding.fromAssetsWhenDue, 'when it is due'),
  ].flat()
  const sentences = sources.length
    ? [`${sources.join(' + ')}, plus growth: ${covered}% covered.`]
    : []

  const hasGap = funding.gap > 1 && covered < 100
  if (!hasGap) return sentences.join(' ')
  const futureEuros = goalKind !== 'pot' ? ' (in future euros)' : ''
  sentences.push(`Still to find: ${euro(funding.gap)}${futureEuros}.`)

  if (homeUse === 'Only as a last resort' && homeValue > 0) {
    const released = Math.round(homeValue * HALF_VALUE_HOME * AFTER_COSTS)
    const closes = released >= funding.gap ? ', which would close this gap.' : '.'
    sentences.push(
      `If you downsized at 70 to a home worth half as much, you'd free about ${euro(released)} in today's money${closes}`,
    )
  }
  return sentences.join(' ')
}
