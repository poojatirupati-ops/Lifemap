import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import type { CheckPlan } from './checkList.ts'

/** The parts of the plan that Your finances and Check your details read. */
export const useFinancePlan = (): CheckPlan =>
  useStore(
    useShallow(({ plan }) => ({
      fin: plan.fin,
      src: plan.src,
      look: plan.look,
      ack: plan.ack,
      asm: plan.asm,
      saved: plan.saved,
      about: plan.about,
      partner: plan.partner,
      lists: plan.lists,
      retireAge: plan.retireAge,
    })),
  )
