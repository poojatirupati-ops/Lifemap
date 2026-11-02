import { useShallow } from 'zustand/react/shallow'
import type { ProfileAnswers } from '../domain/discovery/profile.ts'
import { useStore } from '../state/store.ts'

export const useProfileAnswers = (): ProfileAnswers =>
  useStore(
    useShallow(({ plan }) => ({ discover: plan.answers, money: plan.moneyProfile.answers, products: plan.moneyProfile.chips })),
  )
