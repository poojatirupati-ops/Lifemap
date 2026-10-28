import type { Plan } from '../state/types.ts'

/** Every screen key the original has; any other key is not a screen and falls back. */
// ponytail: remove when all screens are ported; then screenFor needs only the fallback.
export const SCREEN_KEYS = new Set(
  `D0 D1 DQ DR DS F1 F2 F4 P1 P1E P1S P1K P2 P3 PU P4 U1 PLAN GOALS ME HOME0 PLAN0 B1 B4 XPL ACCT
  PST MORT XTOPIC XCAT CALC VIDS VID HOME EXP SET`.split(/\s+/),
)

const inPlanBuilderShell = (plan: Plan) => plan.shell && !plan.app && plan.tab === 'plan'

/** The tab bar shows in the app and the shell, except inside the plan builder. */
export const showsTabBar = (plan: Plan) =>
  (plan.app || plan.shell) && !(plan.pb && inPlanBuilderShell(plan))

/** Where a key that is not a screen lands: B1 inside the plan builder, otherwise Welcome. */
export const fallbackKey = (plan: Plan) => (inPlanBuilderShell(plan) ? 'B1' : 'D0')

/**
 * Which screen shows for this plan and the current screen (the navigation slice's `screen`).
 * `param` is the explore stack's parameter (a calculator or video id).
 */
export function pickScreen(plan: Plan, screen: string): { key: string; param?: string } {
  const financesKey = plan.upl ? 'PU' : plan.fsec != null ? 'P3' : 'P2'

  if (plan.admin) return { key: 'SET' }

  if ((plan.shell || plan.app) && plan.tab === 'explore') {
    const top = plan.xs.at(-1)
    return top ? { key: top.v, param: top.p } : { key: 'XPL' }
  }

  if (plan.shell && !plan.app) {
    if (plan.tab === 'home') return { key: 'HOME0' }
    if (plan.tab === 'me') return { key: 'ME' }
    if (plan.tab !== 'plan') return { key: 'EXP' }
    if (!plan.pb) return { key: 'PLAN0' }
    return { key: screen.startsWith('D') ? 'B1' : screen }
  }

  if (plan.app) {
    if (plan.tab === 'home') return { key: 'HOME' }
    if (plan.tab === 'plan') return { key: plan.planSeg === 'add' ? 'GOALS' : 'PLAN' }
    if (plan.tab === 'me') return { key: plan.me === 'fin' ? financesKey : 'ME' }
    return { key: plan.exp === 'fin' ? financesKey : 'EXP' }
  }

  if (/^D[2-7]$/.test(screen)) return { key: 'DQ' }
  return { key: screen || 'D0' }
}
