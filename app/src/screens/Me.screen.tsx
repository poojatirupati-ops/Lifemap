import { resolve, type Screen } from '../shell/screens.tsx'
import { useStore } from '../state/store.ts'
import type { Plan, Ui } from '../state/types.ts'
import * as Hub from './MeHub.screen.tsx'
import * as Details from './MeDetails.screen.tsx'
import * as Privacy from './MePrivacy.screen.tsx'
import * as Money from './MeMoney.screen.tsx'
import * as Assumptions from './MeAssumptions.screen.tsx'
import * as Recheck from './MeRecheck.screen.tsx'
import * as Terms from './MeTerms.screen.tsx'
import * as Profile from './MeProfile.screen.tsx'
import * as ProfileSection from './MeProfileSection.screen.tsx'
import * as ProfileResult from './MeProfileResult.screen.tsx'

/** The Me tab: one screen key, a page per plan.me. */
const PAGES: Record<string, Screen> = {
  details: Details,
  privacy: Privacy,
  money: Money,
  asm: Assumptions,
  recheck: Recheck,
  terms: Terms,
  um: Profile,
  ums: ProfileSection,
  umr: ProfileResult,
}

const pageOf = (ui: Ui) => PAGES[ui.mePage] ?? Hub

export const key = 'ME'
export const id = (plan: Plan, ui: Ui) => resolve(pageOf(ui).id, plan, ui)
export const note = (plan: Plan, ui: Ui) => resolve(pageOf(ui).note, plan, ui)

export const Head = () => pageOf(useStore.getState()).Head?.({}) ?? null

export function Body() {
  const Page = useStore((store) => pageOf(store).Body)
  return <Page />
}

export const footFor = (_plan: Plan, ui: Ui) => pageOf(ui).Foot
