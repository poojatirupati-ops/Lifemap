// What comes after the foundations ladder: the next best step and the greeting's stage.
import { tenths, type Foundation } from './foundationCheck.ts'

const NEXT_TITLE: Record<number, (level: Foundation) => string> = {
  1: (level) =>
    level.status === 'bad'
      ? 'Spend less than you earn first'
      : 'Give yourself more room each month',
  2: () => 'Build your emergency fund first',
  3: (level) =>
    level.tool === 'debtpay' ? 'Clear your costly debt first' : 'Check your protection first',
  4: () => 'Get your goals on track',
  5: () => "Start growing your wealth when you're ready",
}

export type NextFoundation = { level: Foundation; title: string; detail: string }

/** The first level that isn't solid, as the next best step. */
export function nextFoundation(levels: Foundation[], targetMonths: number): NextFoundation | null {
  const level = levels.find(({ status }) => status !== 'ok')
  if (!level) return null
  const detail =
    level.status !== 'na' && level.level === 2 && level.months != null
      ? `You're ${tenths(level.months)} of ${targetMonths} months there.`
      : `${level.text}.`
  return { level, title: NEXT_TITLE[level.level](level), detail }
}

const STAGES = [
  'Building foundations',
  'Building foundations',
  'Protecting your family',
  'Securing your goals',
  'Growing wealth',
]

/** Where the customer is on the ladder, for the greeting. */
export function foundationStage(levels: Foundation[]) {
  const first = levels.findIndex(({ status }) => status !== 'ok')
  return STAGES[first] ?? 'Growing wealth'
}
