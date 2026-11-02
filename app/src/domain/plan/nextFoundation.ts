// The next foundation to work on: the lowest level that is not yet solid.
import { tenths, type Foundation } from '../planning/foundationCheck.ts'

const TITLES = [
  '',
  'Build your emergency fund first',
  '',
  'Get your goals on track',
  'Start growing your wealth when you’re ready',
]

function title(level: Foundation) {
  if (level.level === 1)
    return level.status === 'bad'
      ? 'Spend less than you earn first'
      : 'Give yourself more room each month'
  if (level.level === 3)
    return level.tool === 'debtpay' ? 'Clear your costly debt first' : 'Check your protection first'
  return TITLES[level.level - 1]
}

/** The first level not yet solid, with what to do next; null when all five are solid. */
export function nextFoundation(levels: Foundation[], bufferMonths: number) {
  const level = levels.find((item) => item.status !== 'ok')
  if (!level) return null
  const detail =
    level.status !== 'na' && level.level === 2 && level.months != null
      ? `You’re ${tenths(level.months)} of ${bufferMonths} months there.`
      : `${level.text}.`
  return { level, title: title(level), detail }
}
