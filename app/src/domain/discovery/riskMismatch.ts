// What the customer wants against what they can afford, and the notes that explain it.
import { euro } from '../../lib/format.ts'
import { THIN_CUSHION_REASONS, type MismatchKey } from './profile.data.ts'

export type CushionLevel =
  'In place' | 'Thin' | 'None' | 'None: relies on credit' | 'Not set up yet'

/** The emergency-fund read, from the cashflow code. */
export interface Cushion {
  /** months come from the customer's own figures, not their Q7 answer */
  hasFigures: boolean
  months: number | null
  targetMonths: number
  shortfall: number | null
  level: CushionLevel | null
  answer: CushionLevel | null
}

export function isCushionThin(cushion: Cushion, surprise: number | null, savingsMonths?: number) {
  if (cushion.hasFigures) return cushion.level !== 'In place'
  const surpriseHurts = surprise != null && surprise <= 2
  const savingsShort = savingsMonths != null && savingsMonths <= 1
  return surpriseHurts || savingsShort
}

interface Fit {
  appetite: number
  composure: number
  thinCushion: boolean
  lowCapacity: boolean
  shortHorizon: boolean
  canAfford: boolean
  readyForGrowth: boolean
}

// What they want against what they can afford, safety first.
export function mismatchKey(fit: Fit): MismatchKey {
  const wantsMore = fit.appetite >= 3
  const wantsLess = fit.appetite <= 2
  const unsettled = fit.composure <= 2
  const cannotAfford = fit.thinCushion || fit.lowCapacity || fit.shortHorizon
  if (wantsLess && unsettled && cannotAfford) return 'K16'
  if (wantsMore && fit.thinCushion) return 'K14c'
  if (wantsMore && fit.lowCapacity) return 'K14l'
  if (wantsMore && fit.shortHorizon) return 'K14t'
  if (wantsMore && unsettled) return 'K13'
  if (wantsLess && fit.canAfford) return 'K15'
  if (wantsMore && fit.canAfford && fit.readyForGrowth) return 'K17'
  return 'OK'
}

// Says why, and what to do, in the customer's own terms.
export function thinCushionMessage(cushion: Cushion, surpriseOption = 0) {
  const { months, targetMonths } = cushion
  const shortfall = cushion.shortfall ?? 0
  const why = cushion.hasFigures
    ? `your emergency fund covers ${months} of ${targetMonths} months of essential spending`
    : (THIN_CUSHION_REASONS[surpriseOption] ?? THIN_CUSHION_REASONS[0])
  const more = cushion.hasFigures && shortfall > 0 ? ` (about ${euro(shortfall)} more for you)` : ''
  return `You're open to ups and downs, but ${why}. Build ${targetMonths} months of essential spending first${more}. Many people do this before taking more risk.`
}

// When their answer about surprises and their own figures disagree.
export function cushionMismatchNote({ hasFigures, answer, level, months, targetMonths }: Cushion) {
  if (!hasFigures || !answer) return null
  const isInPlace = level === 'In place'
  if ((answer === 'In place') === isInPlace) return null
  return isInPlace
    ? `You said a surprise would be hard to cover, but your cash already covers ${months} months. You're better covered than you think.`
    : `You said you have money for surprises, but on your figures it covers ${months} of ${targetMonths} months.`
}
