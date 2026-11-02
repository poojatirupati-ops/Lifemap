import { missingChoices } from '../domain/planning/requiredChoices.ts'
import { usePlanFields } from './usePlanFields.ts'

/** The choices only the customer can make that are still open. */
export const useMissingChoices = () =>
  missingChoices(
    usePlanFields('retireSet', 'assumptions', 'inflation', 'about', 'figures', 'partnerRetireSet'),
  )
