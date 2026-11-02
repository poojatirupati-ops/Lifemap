import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { project } from '../domain/planning/project.ts'
import { whatIfFrom } from '../domain/planning/wi.ts'
import { useStore } from '../state/store.ts'

/** The plan as it stands and with the current what-if, recomputed only when an input changes. */
export function useProjection() {
  const inputs = useStore(
    useShallow(({ plan }) => ({
      figures: plan.figures,
      about: plan.about,
      assumptions: plan.assumptions,
      lists: plan.lists,
      sources: plan.sources,
      retireAge: plan.retireAge,
      partnerRetireAge: plan.partnerRetireAge,
      partnerRetireSet: plan.partnerRetireSet,
      goals: plan.goals,
      rank: plan.rank,
      answers: plan.answers,
      monthlySaving: plan.monthlySaving,
      savingAtRule: plan.savingAtRule,
      inflation: plan.inflation,
      assumptionSet: plan.assumptionSet,
    })),
  )
  const savedWhatIf = useStore((store) => store.plan.whatIf)
  return useMemo(() => {
    const whatIf = whatIfFrom(savedWhatIf)
    return { inputs, whatIf, base: project(inputs), withWhatIf: project(inputs, whatIf) }
  }, [inputs, savedWhatIf])
}

export type Projection = ReturnType<typeof project>
