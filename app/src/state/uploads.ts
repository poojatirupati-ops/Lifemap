import { FINANCE_SECTIONS } from '../domain/finances/sections.data.ts'
import { confirmUpload, type Upload } from '../domain/finances/upload.ts'
import { prefersReducedMotion } from '../hooks/reducedMotion.ts'
import { parseWholeEuros } from '../lib/format.ts'
import { show, updateFinances } from './finances.ts'
import type { SetStore, Store } from './store.ts'
import { toast } from './shell.ts'

/** Reading documents (a mock reader): scan, then confirm or fail. */
export interface UploadActions {
  /** Starts reading; a file named with "fail" shows the failure. */
  startUpload: (section: string, files: string[], item?: Upload['item']) => void
  cancelUpload: () => void
  /** The document stays on the checklist and the section opens to type it in. */
  typeInstead: () => void
  /** A correction to a figure we read; it is still the document's figure. */
  correctReadValue: (field: string, text: string) => void
  addReadValues: () => void
}

export function createUploadsSlice(set: SetStore, get: () => Store): UploadActions {
  const update = updateFinances(get)

  return {
    startUpload: (section, files, item = null) => {
      update((plan, ui) => {
        ui.upload = { section, stage: 'scan', files, edit: {}, item }
        if (!plan.hasResults) return
        if (ui.tab === 'plan' || ui.tab === 'home') ui.tab = 'me'
        if (ui.tab === 'me') ui.mePage = 'fin'
        else ui.expertsPage = 'fin'
      })
      show(get, 'PU')
      const stage = files.some((file) => /fail/i.test(file)) ? 'fail' : 'confirm'
      setTimeout(
        () =>
          update((_, ui) => {
            if (ui.upload) ui.upload.stage = stage
          }),
        prefersReducedMotion() ? 200 : 1500,
      )
    },

    cancelUpload: () => {
      set({ upload: null })
      const { plan, financeSection, go } = get()
      if (!plan.hasResults) go(financeSection != null ? 'P3' : 'P2')
    },

    typeInstead: () => {
      const { section, files } = get().upload!
      update((plan, ui) => {
        plan.missingDocs = [...(plan.missingDocs ?? []), ...files]
        ui.upload = null
        plan.entryMode[section] = 'type'
      })
      const index = FINANCE_SECTIONS.findIndex(({ id }) => id === section)
      if (index >= 0) get().openSection(index)
      else if (!get().plan.hasResults) get().go('P2')
    },

    correctReadValue: (field, text) =>
      update((_, ui) => {
        ui.upload!.edit[field] = parseWholeEuros(text) ?? 0
      }),

    addReadValues: () => {
      const upload = get().upload!
      update((plan, ui) => {
        confirmUpload(plan, upload)
        ui.upload = null
        if (upload.item) return
        ui.financeSection = null
        if (plan.hasResults && ui.tab === 'me') ui.mePage = 'money'
      })
      toast(upload.item ? 'Added from your document' : 'Added from your documents')
      if (!get().plan.hasResults) get().go(upload.item ? 'P3' : 'P2')
    },
  }
}
