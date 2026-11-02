import type { Plan, Ui } from '../state/types.ts'

/** Every screen key the original has; any other key is not a screen and falls back. */
// ponytail: remove when all screens are ported; then screenFor needs only the fallback.
export const SCREEN_KEYS = new Set(
  `D0 D1 DQ DR F1 F2 F4 P1 P1E P1D P1K P2 P3 PU P4 U1 PLAN GOALS ME HOME0 PLAN0 B1 B4 XPL ACCT
  PST MORT XTOPIC XCAT CALC VIDS VID HOME EXP SET`.split(/\s+/),
)

const inPlanBuilderShell = (plan: Plan, ui: Ui) =>
  ui.inShell && !plan.hasResults && ui.tab === 'plan'

/** The tab bar shows in the app and the shell, except inside the plan builder. */
export const showsTabBar = (plan: Plan, ui: Ui) =>
  (plan.hasResults || ui.inShell) && !(ui.planBuilder && inPlanBuilderShell(plan, ui))

/** Where a key that is not a screen lands: B1 inside the plan builder, otherwise Welcome. */
export const fallbackKey = (plan: Plan, ui: Ui) => (inPlanBuilderShell(plan, ui) ? 'B1' : 'D0')

/**
 * Which screen shows for this plan and screen state.
 * `param` is the explore stack's parameter (a calculator or video id).
 */
export function pickScreen(plan: Plan, ui: Ui): { key: string; param?: string } {
  const { screen } = ui
  const financesKey = ui.upload ? 'PU' : ui.financeSection != null ? 'P3' : 'P2'

  if (ui.adminView) return { key: 'SET' }

  if ((ui.inShell || plan.hasResults) && ui.tab === 'explore') {
    const top = ui.explorePages.at(-1)
    // the Mortgages topic has a page of its own
    if (top?.page === 'XTOPIC' && top.param === 'Mortgages') return { key: 'MORT' }
    return top ? { key: top.page, param: top.param } : { key: 'XPL' }
  }

  if (ui.inShell && !plan.hasResults) {
    if (ui.tab === 'home') return { key: 'HOME0' }
    if (ui.tab === 'me') return { key: 'ME' }
    if (ui.tab !== 'plan') return { key: 'EXP' }
    if (!ui.planBuilder) return { key: 'PLAN0' }
    return { key: screen.startsWith('D') ? 'B1' : screen }
  }

  if (plan.hasResults) {
    if (ui.tab === 'home') return { key: 'HOME' }
    if (ui.tab === 'plan') return { key: ui.planSegment === 'add' ? 'GOALS' : 'PLAN' }
    if (ui.tab === 'me') return { key: ui.mePage === 'fin' ? financesKey : 'ME' }
    return { key: ui.expertsPage === 'fin' ? financesKey : 'EXP' }
  }

  if (/^D[2-7]$/.test(screen)) return { key: 'DQ' }
  return { key: screen || 'D0' }
}
