import { useShallow } from 'zustand/react/shallow'
import { missingChoices } from '../components/finance/requiredChoices.ts'
import { useStore } from '../state/store.ts'

/** The choices only the customer can make that are still open. */
export const useMissingChoices = () =>
  missingChoices(
    useStore(
      useShallow(({ plan }) => ({
        retireSet: plan.retireSet,
        assumptions: plan.assumptions,
        inflation: plan.inflation,
        about: plan.about,
        figures: plan.figures,
        partnerRetireSet: plan.partnerRetireSet,
      })),
    ),
  )
