// The retirement projection's warnings and lump-sum sentence.
import { standardFundThreshold } from '../planning/pensions.ts'
import { LAW_TEXT, type Rules } from '../planning/rates.ts'
import { euro, percent } from '../../lib/format.ts'

export const earlyWarning = ({ pen }: Rules) =>
  `Most pensions can't be taken before ${pen.earliestAge} (PRSA and personal pensions; some occupational schemes allow it from 50). Until then you would live on savings and other income. `

/** Today's money against the 2026 threshold, like with like. */
export const fundThresholdWarning = (fundToday: number, rules: Rules, inflation: number | null) =>
  fundToday > standardFundThreshold(rules, 2026, inflation ?? 0)
    ? "Your fund in today's money is above the Standard Fund Threshold (€2.2m in 2026, rising to €2.8m by 2029; later years are not set yet): the excess is taxed at 40%. "
    : ''

function lumpSumWords(share: number, { pen }: Rules) {
  const most = `(the most allowed is ${Math.round(pen.lsMaxPct * 100)}%)`
  return share > 0
    ? `Here ${Math.round(share * 100)}% of the fund is taken as a lump sum ${most}: `
    : `No lump sum is assumed ${most}: `
}

const TAX_NOTE =
  'Desired income and the State Pension are before tax: the State Pension is taxable (USC-exempt) and drawdown pays income tax and USC. '

/** The sentences under the retirement result. */
export function retirementLine(parts: {
  fundToday: number | null
  target: number
  early: string
  sft: string
  lumpShare: number
  rules: Rules
  wage: number
}) {
  const { fundToday, target, early, sft, lumpShare, rules, wage } = parts
  const opening =
    fundToday == null
      ? "Choose your inflation rate to compare your fund with the target in today's money. "
      : fundToday < target
        ? `Your projected fund is worth about ${euro(fundToday)} in today's money, against a target of ${euro(target)}. `
        : 'On these assumptions your projected fund meets the illustrative target. '
  return [
    opening,
    early,
    sft,
    `Contributions are assumed to rise with pay (${percent(wage)} a year), as in your plan. `,
    'The target includes the State Pension you fund yourself for each year you retire before 66. ',
    TAX_NOTE,
    lumpSumWords(lumpShare, rules),
    `${LAW_TEXT.lumpSum}. `,
    'Contributions are counted as paid at the end of each year.',
  ].join('')
}
