import { talkToExpert, openCalculator } from '../components/explore/exploreActions.ts'
import { openSection } from '../components/finance/financeActions.ts'
import type { Foundation } from '../components/home/foundations.ts'
import { tryWhatIf } from '../components/home/homeActions.ts'
import { makePlan } from '../components/me/meActions.ts'

const TOOL_NAMES: Record<string, string> = {
  debtpay: 'Open Debt repayment',
  lifecover: 'Open the Life cover tool',
}

/** The one button that helps most with this level. */
export function foundationAction(level: Foundation): { label: string; run: () => void } {
  if (level.status === 'na')
    return level.makePlan
      ? { label: 'Make my plan', run: makePlan }
      : { label: 'Add it now', run: () => openSection(level.section ?? 0) }
  const { tool } = level
  switch (level.level) {
    case 1:
      return { label: 'Open the Monthly surplus calculator', run: () => openCalculator('surplus') }
    case 2:
      return { label: 'Open the Emergency fund calculator', run: () => openCalculator('emergency') }
    case 3:
      return tool
        ? {
            label: TOOL_NAMES[tool] ?? 'Open Income protection gap',
            run: () => openCalculator(tool),
          }
        : { label: 'Talk to a protection expert', run: () => talkToExpert('protection') }
    case 4:
      return { label: 'Try a what-if', run: () => tryWhatIf() }
    default:
      return { label: 'Talk to an investment expert', run: () => talkToExpert('investment') }
  }
}
