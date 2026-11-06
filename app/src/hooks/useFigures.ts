import { useStore } from 'zustand'
import { figures } from '../domain/planning/settings.ts'

/** The standards in use (the tenant's figures over LifeMap's); re-renders the caller when they change. */
export const useFigures = () => useStore(figures, (state) => state.settings)
