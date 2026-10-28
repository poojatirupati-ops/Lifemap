// TODO(R-32): settings.ts investmentGrowth() and investmentGrowthBasis() always use the 2026 exit tax
// (R-07/R-11 defect); the original uses the plan year's. Use them once they take the plan's rules.
import { percentToTenth, wholePercent } from '../../lib/format.ts'
import type { Rules } from '../../domain/planning/rates.ts'
import type { Settings } from '../../domain/planning/settings.ts'
import { DEFAULT_FUND_CHARGES, type Standard } from '../../domain/planning/settings.data.ts'

/** 'inv' has no figure of its own: growth before fees, less charges, less exit tax every few years. */
export function investmentStandard(settings: Settings, rules: Rules): Standard {
  const { invGross, fundChg, inv } = settings.standards
  const gross = Number(invGross.partnerValue ?? invGross.value)
  const charges = Number(fundChg.partnerValue ?? fundChg.value ?? DEFAULT_FUND_CHARGES)
  const { deemed: years, exit: tax } = rules.sav
  const grown = (1 + gross - charges) ** years
  const growth = Math.round(((grown - tax * (grown - 1)) ** (1 / years) - 1) * 1000) / 1000
  const by = `a planning assumption, not a prediction: ${percentToTenth(gross)} before fees and tax, less about ${percentToTenth(charges)} charges, less ${wholePercent(tax)} exit tax taken every ${years} years`
  return { ...inv, value: growth, by }
}
