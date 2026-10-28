// What Your finances (P2), Check your details (P4) and Building your plan (U1) do.
// TODO(Q-01): move into a finances slice in src/state once the store has per-context slices.
import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import { rerender } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'
import { withRepaymentLooks } from './checkList.ts'
import { FINANCE_FIELDS } from './fields.data.ts'
import { missingChoices } from './requiredChoices.ts'
import { visibleFields } from './status.ts'

const update = (recipe: (plan: Plan) => void) => useStore.getState().update(recipe)
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export function openSection(index: number) {
  update((plan) => {
    plan.fsec = index
    plan.upl = null
    if (plan.app && plan.tab !== 'exp') {
      plan.tab = 'me'
      plan.me = 'fin'
    }
  })
  const { plan, go, closeSheet } = useStore.getState()
  if (plan.app) closeSheet()
  else go('P3')
}

/** From Check your details: the section's Back returns to the check. */
export function fixSection(index: number) {
  update((plan) => {
    if (!plan.app) plan.from = 'check'
  })
  openSection(index)
}

export const leaveForAdviser = (key: string) =>
  update((plan) => {
    plan.ack[key] = true
  })

export function leaveSectionForAdviser(sectionId: string) {
  const section = FINANCE_SECTIONS.find(({ id }) => id === sectionId)!
  update((plan) => {
    for (const key of visibleFields(section, plan)) {
      if (!FINANCE_FIELDS[key].optional) plan.ack[key] = true
    }
  })
}

/** Flags card, loan and mortgage repayments too low to clear the debt. */
export function flagLowRepayments() {
  const { plan } = useStore.getState()
  const look = withRepaymentLooks(plan)
  if (JSON.stringify(look) === JSON.stringify(plan.look)) return
  update((draft) => {
    draft.look = look
  })
}

export const backToMe = () =>
  update((plan) => {
    plan.me = 'home'
    plan.fsec = null
    plan.upl = null
    if (plan.tab === 'exp') plan.exp = 'home'
  })

/** Shows Building your plan, then opens the results in My Plan. */
export function seeResults(checked: boolean) {
  if (missingChoices(useStore.getState().plan).length) return
  update((plan) => {
    plan.checked = checked
  })
  useStore.getState().go('U1')
  setTimeout(
    () => {
      update((plan) => {
        Object.assign(plan, { app: true, pb: false, shell: true, tab: 'plan' })
        plan.planSeg = 'main'
        plan.planGo = 'results'
        // TODO(R-17): the version history slice; the original keeps a fixed date
        if (!plan.versions.some(({ note }) => /results/.test(note))) {
          plan.versions.push({ note: 'First results', date: '29 Sep 2026' })
        }
      })
      rerender()
    },
    reducedMotion() ? 300 : 1400,
  )
}
