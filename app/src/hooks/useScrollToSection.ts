import { useLayoutEffect } from 'react'
import { useStore } from '../state/store.ts'
import type { PlanSection } from '../state/types.ts'

/** Where a "show me" link lands on My Plan; the timeline is the top. */
const SECTION_IDS: Record<PlanSection, string | null> = {
  timeline: null,
  results: 'r-res',
  wi: 'r-wi',
  fnd: 'r-fnd',
}

/** Scroll My Plan to the section asked for (results, what-if, foundations), or to the top; once. */
export function useScrollToSection() {
  const section = useStore((store) => store.planScrollTo)
  const sectionShown = useStore((store) => store.sectionShown)
  useLayoutEffect(() => {
    if (section == null) return
    const target = document.getElementById(SECTION_IDS[section] ?? '')
    if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' })
    else document.getElementById('main')?.scrollTo({ top: 0, behavior: 'instant' })
    sectionShown()
  }, [section, sectionShown])
}
