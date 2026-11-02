import { useShallow } from 'zustand/react/shallow'
import { profileAnswers, type ProfileAnswers } from '../domain/discovery/profile.ts'
import { useStore } from '../state/store.ts'

export const useProfileAnswers = (): ProfileAnswers =>
  useStore(useShallow(({ plan }) => profileAnswers(plan)))
