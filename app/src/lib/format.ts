// Money and percent text, same output as the original.

/** −€1,234 */
export function euro(amount: number) {
  return (amount < 0 ? '−€' : '€') + Math.round(Math.abs(amount)).toLocaleString('en-IE')
}

/** €950, €12k, €1.3m */
export function euroShort(amount: number) {
  if (amount >= 1e6) return '€' + (Math.round(amount / 1e5) / 10).toLocaleString('en-IE') + 'm'
  if (amount >= 1000) return '€' + Math.round(amount / 1000) + 'k'
  return euro(amount)
}

/** Weekly rates keep their cents: €299.30, €254 */
export function euroWeekly(amount: number) {
  return '€' + (Math.abs(amount % 1) > 1e-9 ? amount.toFixed(2) : Math.round(amount))
}

/** 0.035 -> "3.5%" */
export function percent(fraction: number) {
  return Number((fraction * 100).toFixed(2)) + '%'
}

/** 0.065 -> "6.5%" */
export const percentToTenth = (fraction: number) => `${Math.round(fraction * 1000) / 10}%`

/** 0.35 -> "35%" */
export const wholePercent = (fraction: number) => `${Math.round(fraction * 100)}%`

/** null, empty string and NaN count as no value. */
export function hasValue(value: unknown) {
  return value != null && value !== '' && !Number.isNaN(value)
}

/** A typed figure that reads as a number ("12", 12), not "abc" or blank. */
export const isNumber = (value: unknown) => hasValue(value) && !Number.isNaN(Number(value))

/** A typed figure as a number; blank or not a number is 0. */
export const toNumber = (value: unknown) => (isNumber(value) ? Number(value) : 0)

export const sum = <T>(items: T[], amount: (item: T, index: number) => number) =>
  items.reduce((total, item, index) => total + amount(item, index), 0)

/** The digits typed in a euro box, as a whole number ("€1,200" is 1200); null when there are none. */
export function parseWholeEuros(text: string) {
  const whole = parseInt(text.replace(/\D/g, ''))
  return isNaN(whole) ? null : whole
}

/** plural(3, 'yr') -> "3 yrs", plural(1, 'month') -> "1 month" */
export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`
