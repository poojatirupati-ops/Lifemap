// TODO(R-32): planned home is src/state/settings.ts. The planning domain still reads defaultSettings,
// so a partner figure set here shows only in this view until those readers take settings from here.
import { create } from 'zustand'
import { produce } from 'immer'
import { defaultSettings, type Settings, type StandardKey } from '../../domain/planning/settings.ts'
import type { StandardValue } from '../../domain/planning/settings.data.ts'

interface SettingsStore {
  settings: Settings
  /** The last partner figure refused for being out of range, shown under its input. */
  refused: { key: StandardKey; message: string } | null
  setPartner: (name: string) => void
  setPartnerFigure: (key: StandardKey, figure: StandardValue | null) => void
  refuse: (key: StandardKey, message: string) => void
  backToStandards: () => void
}

export const useSettings = create<SettingsStore>()((set) => ({
  settings: structuredClone(defaultSettings),
  refused: null,

  setPartner: (name) =>
    set(({ settings }) => ({ settings: { ...settings, partner: name.trim() } })),

  setPartnerFigure: (key, figure) =>
    set(({ settings, refused }) => ({
      settings: produce(settings, (draft) => {
        if (figure == null) delete draft.standards[key].partnerValue
        else draft.standards[key].partnerValue = figure
      }),
      refused: refused?.key === key ? null : refused,
    })),

  refuse: (key, message) => set({ refused: { key, message } }),

  backToStandards: () => set({ settings: structuredClone(defaultSettings), refused: null }),
}))

export const partnerName = (settings: Settings) => settings.partner || 'your provider'
