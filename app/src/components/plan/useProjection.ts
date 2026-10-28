import { useMemo } from 'react'
import { project } from '../../domain/planning/project.ts'
import { whatIfFrom } from '../../domain/planning/wi.ts'
import { useStore } from '../../state/store.ts'

/** The plan as it stands and with the current what-if applied, recomputed only when the plan changes. */
export function useProjection() {
  const plan = useStore((store) => store.plan)
  return useMemo(() => {
    const whatIf = whatIfFrom(plan.wi)
    return { plan, whatIf, base: project(plan), withWhatIf: project(plan, whatIf) }
  }, [plan])
}

export type Projection = ReturnType<typeof project>
