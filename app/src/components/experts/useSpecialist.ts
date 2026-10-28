import { useMemo } from 'react'
import { project } from '../../domain/planning/project.ts'
import { useStore } from '../../state/store.ts'
import { specialistFor } from './booking.ts'

/** The kind of expert to match; the plan is only projected once it exists. */
export function useSpecialist() {
  const plan = useStore((store) => store.plan)
  return useMemo(() => specialistFor(plan, plan.app ? project(plan).percent : {}), [plan])
}
