import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { defaultSettings, type Settings, type StandardKey } from '../domain/planning/settings.ts'
import type { StandardValue } from '../domain/planning/settings.data.ts'

interface SettingsState {
  settings: Settings
  /** The last partner figure refused for being out of range, shown under its input. */
  refused: { key: StandardKey; message: string } | null
  setPartner: (name: string) => void
  setPartnerFigure: (key: StandardKey, figure: StandardValue) => void
  refuse: (key: StandardKey, message: string) => void
  backToStandards: () => void
}

// TODO(R-32): merge into useStore as a `settings` slice (needs store.ts, R-02). Until then the planning
// domain reads defaultSettings, so a partner figure shows only in the admin view.
export const useSettings = create<SettingsState>()(
  immer((set) => ({
    settings: structuredClone(defaultSettings),
    refused: null,

    setPartner: (name) => set((draft) => void (draft.settings.partner = name.trim())),

    setPartnerFigure: (key, figure) =>
      set((draft) => {
        const standard = draft.settings.standards[key]
        if (figure == null) delete standard.partnerValue
        else Object.assign(standard, { partnerValue: figure })
        if (draft.refused?.key === key) draft.refused = null
      }),

    refuse: (key, message) => set((draft) => void (draft.refused = { key, message })),

    backToStandards: () => set({ settings: structuredClone(defaultSettings), refused: null }),
  })),
)
