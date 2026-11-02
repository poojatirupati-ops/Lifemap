// Explore's actions: its pages, the focus area, and the ways out of it.
// Module-level actions on the one store (zustand's "actions outside the store" pattern).
import { isExpertKind } from '../domain/identity/advisers.data.ts'
import type { VideoKind } from '../content/cms.tsx'
import { toast } from './shell.ts'
import { useStore } from './store.ts'
import { currentArea, goTo, router } from '../shell/router.ts'
import type { Plan, Ui } from './types.ts'

const update = (recipe: (plan: Plan, ui: Ui) => void) => useStore.getState().update(recipe)

/** Open an Explore page from any tab; its Back returns to the page it was opened from when that was in Explore too. */
export function openExplorePage(href: string, replace = false) {
  useStore.getState().closeSheet()
  return router.navigate({ href, replace, state: { explore: currentArea() === 'explore' } })
}

export const openTopic = (name: string) =>
  openExplorePage(`/explore/topic/${encodeURIComponent(name)}`)
export const openCategory = (id: string) => openExplorePage(`/explore/category/${id}`)
export const openCalculator = (id: string) => openExplorePage(`/explore/calculator/${id}`)
export const openVideos = () => openExplorePage('/explore/videos')
export function openVideo(id: string) {
  update((_, ui) => void (ui.playing = false))
  return openExplorePage(`/explore/videos/${id}`)
}

/** Filter the video library to one topic, or 'all'. */
export const showVideoKind = (kind: VideoKind | 'all') => useStore.setState({ videoFilter: kind })

export const togglePlay = () => update((_, ui) => void (ui.playing = !ui.playing))

/** Back one Explore page, or to Explore itself when the page was opened from another tab or a link. */
export function exploreBack() {
  update((_, ui) => void (ui.playing = false))
  if (router.state.location.state.explore) router.history.back()
  else goTo('/explore')
}

/** The Experts tab, with this kind of expert picked when there is one. */
export function talkToExpert(kind: string) {
  update((plan, ui) => {
    ui.playing = false
    ui.sheet = null
    if (isExpertKind(kind)) plan.booking.spec = kind
  })
  goTo('/experts')
}

export const showFocusArea = (index: number) => useStore.setState({ focusArea: index })

export const remindMe = () => toast("We'll remind you before it starts")
