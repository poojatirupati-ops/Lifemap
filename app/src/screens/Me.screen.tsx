import { resolve, type Screen } from '../shell/screens.tsx'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'
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

const pageOf = (plan: Plan) => PAGES[plan.me] ?? Hub

export const key = 'ME'
export const id = (plan: Plan) => resolve(pageOf(plan).id, plan)
export const note = (plan: Plan) => resolve(pageOf(plan).note, plan)

export const Head = () => pageOf(useStore.getState().plan).Head?.({}) ?? null

export function Body() {
  const Page = useStore(({ plan }) => pageOf(plan).Body)
  return <Page />
}

export const footFor = (plan: Plan) => pageOf(plan).Foot
