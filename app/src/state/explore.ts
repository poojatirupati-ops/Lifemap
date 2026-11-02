// Explore's actions: its page stack (explorePages), the focus area, and the ways out of it.
// Module-level actions on the one store (zustand's "actions outside the store" pattern).
import { isExpertKind } from '../domain/identity/advisers.data.ts'
import type { VideoKind } from '../content/cms.tsx'
import { toast } from './shell.ts'
import { useStore } from './store.ts'
import type { Plan, Ui } from './types.ts'

type Page = Ui['explorePages'][number]

const update = (recipe: (plan: Plan, ui: Ui) => void) => useStore.getState().update(recipe)

/** Open a page on top of Explore's stack, from any tab. */
function openPage(page: Page, also?: (plan: Plan, ui: Ui) => void) {
  update((plan, ui) => {
    if (ui.tab !== 'explore') {
      ui.tab = 'explore'
      ui.explorePages = []
    }
    also?.(plan, ui)
    ui.explorePages.push(page)
    ui.sheet = null
  })
}

export const openTopic = (name: string) => openPage({ page: 'XTOPIC', param: name })
export const openCategory = (id: string) => openPage({ page: 'XCAT', param: id })
export const openCalculator = (id: string) => openPage({ page: 'CALC', param: id })
export const openVideos = () => openPage({ page: 'VIDS' })
export const openVideo = (id: string) =>
  openPage({ page: 'VID', param: id }, (_, ui) => void (ui.playing = false))

/** Filter the video library to one topic, or 'all'. */
export const showVideoKind = (kind: VideoKind | 'all') => useStore.setState({ videoFilter: kind })

export const togglePlay = () => update((_, ui) => void (ui.playing = !ui.playing))

/** Back one Explore page; leaving the sign-in gate returns to where the customer was. */
export function exploreBack() {
  const { afterGate, explorePages } = useStore.getState()
  const top = explorePages.at(-1)
  if (top?.page === 'ACCT' && afterGate) useStore.getState().go(String(afterGate.scr))
  update((_, ui) => {
    ui.explorePages.pop()
    if (top?.page === 'ACCT') ui.afterGate = null
    if (top?.page === 'PST') ui.statement = null
    ui.playing = false
  })
}

/** The Experts tab, with this kind of expert picked when there is one. */
export function talkToExpert(kind: string) {
  update((plan, ui) => {
    ui.tab = 'exp'
    ui.expertsPage = 'home'
    ui.explorePages = []
    ui.playing = false
    ui.sheet = null
    if (isExpertKind(kind)) plan.booking.spec = kind
  })
}

export const showFocusArea = (index: number) => useStore.setState({ focusArea: index })

/** The what-if panel on the plan, set to this goal. */
export const tryWhatIf = (goalId: number) => useStore.getState().tryWhatIf(goalId)

export const remindMe = () => toast("We'll remind you before it starts")
