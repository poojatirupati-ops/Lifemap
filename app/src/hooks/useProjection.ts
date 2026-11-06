import { useMemo } from 'react'
import { project } from '../domain/planning/project.ts'
import { whatIfFrom } from '../domain/planning/wi.ts'
import { useStore } from '../state/store.ts'
import { usePlanFields } from './usePlanFields.ts'

/** The plan as it stands and with the current what-if, recomputed only when an input (or the standards in use) changes. */
export function useProjection() {
  const inputs = usePlanFields(
    'figures',
    'about',
    'assumptions',
    'lists',
    'sources',
    'retireAge',
    'partnerRetireAge',
    'partnerRetireSet',
    'goals',
    'rank',
    'answers',
    'monthlySaving',
    'savingAtRule',
    'inflation',
    'assumptionSet',
  )
  const savedWhatIf = useStore((store) => store.plan.whatIf)
  return useMemo(() => {
    const whatIf = whatIfFrom(savedWhatIf)
    return { inputs, whatIf, base: project(inputs), withWhatIf: project(inputs, whatIf) }
  }, [inputs, savedWhatIf])
}

export type Projection = ReturnType<typeof project>
