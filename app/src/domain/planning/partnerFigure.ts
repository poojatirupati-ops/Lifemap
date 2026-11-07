// A partner's own figure for a LifeMap standard: what is allowed and how a typed or picked entry is read.
import { readPoints } from '../../lib/format.ts'
import type { Settings } from './settings.ts'
import type { Standard, StandardKey, StandardValue } from './settings.data.ts'

/** Sane limits for a partner's figure, in the figure's own units (0.03 = 3%). */
export const LIMITS: Partial<Record<StandardKey, [min: number, max: number]>> = {
  infl: [0, 0.06],
  wage: [0, 0.06],
  cash: [0, 0.04],
  inv: [0, 0.06],
  invGross: [0, 0.08],
  pen: [0, 0.07],
  penRet: [0, 0.06],
  rentRise: [0, 0.08],
  houseGrow: [0, 0.06],
  upkeep: [0, 0.03],
  ownShare: [0, 1],
  retireMult: [15, 40],
  retireSpend: [0.4, 1],
  lumpSum: [0, 0.25],
  safetyMonths: [1, 12],
  safetyMonthsTwo: [1, 12],
  cashYears: [1, 10],
  investShare: [0, 1],
  cgtGain: [0, 1],
  saveShare: [0, 1],
  noAnswer: [0, 5000],
  lifeShare: [0.3, 1],
  lifeYears: [1, 30],
  mortRate: [0.005, 0.1],
  loanRate: [0, 0.3],
  cardRate: [0, 0.35],
  depRate: [0, 0.06],
  buyFees: [0, 50000],
  fundChg: [0, 0.05],
  waitYears: [0, 20],
  style: [1, 3],
}

export const partnerName = (settings: Settings) => settings.partner || 'your provider'

type Entry = { figure: StandardValue } | { refused: 'notNumber' | 'outOfRange' }

const EPSILON = 1e-9

/** Read a typed partner figure (item picks one rate of a list); only a blank box means the LifeMap standard. */
export function readEntry(key: StandardKey, standard: Standard, raw: string, item = 0): Entry {
  const text = raw.trim()
  const typed = readPoints(text)
  if (text && typed == null) return { refused: 'notNumber' }

  if (standard.unit === 'pct3') {
    const base = standard.value
    const list = [...(standard.partnerValue ?? base)]
    list[item] = typed == null ? base[item] : Math.max(0, typed) / 100
    const unchanged = list.every((rate, i) => Math.abs(rate - base[i]) < EPSILON)
    return { figure: unchanged ? null : list }
  }

  if (typed == null) return { figure: null }
  const figure = standard.unit === 'pct' ? typed / 100 : typed
  const limits = LIMITS[key]
  if (limits && (figure < limits[0] - EPSILON || figure > limits[1] + EPSILON)) {
    return { refused: 'outOfRange' }
  }
  return { figure: Math.max(0, figure) }
}
