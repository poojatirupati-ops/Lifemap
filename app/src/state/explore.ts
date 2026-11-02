// Explore's actions: its page stack (plan.xs), the focus area, and the ways out of it.
// Module-level actions on the one store (zustand's "actions outside the store" pattern).
import { isExpertKind } from '../domain/identity/advisers.data.ts'
import type { VideoKind } from '../components/explore/videos.data.ts'
import { toast } from './shell.ts'
import { useStore } from './store.ts'
import type { Plan } from './types.ts'

type Page = Plan['explorePages'][number]

const update = (recipe: (plan: Plan) => void) => useStore.getState().update(recipe)
const closeSheet = () => useStore.getState().closeSheet()

/** Open a page on top of Explore's stack, from any tab. */
function openPage(page: Page, also?: (plan: Plan) => void) {
  update((plan) => {
    if (plan.tab !== 'explore') {
      plan.tab = 'explore'
      plan.explorePages = []
    }
    also?.(plan)
    plan.explorePages.push(page)
  })
  closeSheet()
}

export const openTopic = (name: string) => openPage({ page: 'XTOPIC', param: name })
export const openCategory = (id: string) => openPage({ page: 'XCAT', param: id })
export const openCalculator = (id: string) => openPage({ page: 'CALC', param: id })
export const openVideos = () => openPage({ page: 'VIDS' })
export const openVideo = (id: string) =>
  openPage({ page: 'VID', param: id }, (plan) => {
    plan.playing = false
  })

/** Filter the video library to one topic, or 'all'. */
export const showVideoKind = (kind: VideoKind | 'all') =>
  update((plan) => {
    plan.videoFilter = kind
  })

export const togglePlay = () =>
  update((plan) => {
    plan.playing = !plan.playing
  })

/** Back one Explore page; leaving the sign-in gate returns to where the customer was. */
export function exploreBack() {
  const { afterGate: after, explorePages: xs } = useStore.getState().plan
  const top = xs.at(-1)
  if (top?.page === 'ACCT' && after) useStore.getState().go(String(after.scr))
  update((plan) => {
    plan.explorePages.pop()
    if (top?.page === 'ACCT') plan.afterGate = null
    if (top?.page === 'PST') plan.statement = null
    plan.playing = false
  })
}

/** The Experts tab, with this kind of expert picked when there is one. */
export function talkToExpert(kind: string) {
  update((plan) => {
    plan.tab = 'exp'
    plan.expertsPage = 'home'
    plan.explorePages = []
    plan.playing = false
    if (isExpertKind(kind)) plan.booking.spec = kind
  })
  closeSheet()
}

export const showFocusArea = (index: number) =>
  update((plan) => {
    plan.focusArea = index
  })

/** The what-if panel on the plan, set to this goal. */
export const tryWhatIf = (goalId: number) => useStore.getState().tryWhatIf(goalId)

export const remindMe = () => toast("We'll remind you before it starts")
