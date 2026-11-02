import { FINANCE_SECTIONS } from '../domain/finances/sections.data.ts'
import { confirmUpload, type Upload } from '../domain/finances/upload.ts'
import { prefersReducedMotion } from '../hooks/reducedMotion.ts'
import { parseWholeEuros } from '../lib/format.ts'
import { show, updateFinances, type FinancesActions, type StoreCore } from './finances.ts'
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

export function createUploadsSlice(get: () => StoreCore & FinancesActions): UploadActions {
  const update = updateFinances(get)

  return {
    startUpload: (section, files, item = null) => {
      update((plan) => {
        plan.upload = { section, stage: 'scan', files, edit: {}, item }
        if (!plan.hasResults) return
        if (plan.tab === 'plan' || plan.tab === 'home') plan.tab = 'me'
        if (plan.tab === 'me') plan.mePage = 'fin'
        else plan.expertsPage = 'fin'
      })
      show(get, 'PU')
      const stage = files.some((file) => /fail/i.test(file)) ? 'fail' : 'confirm'
      setTimeout(
        () =>
          update((plan) => {
            if (plan.upload) plan.upload.stage = stage
          }),
        prefersReducedMotion() ? 200 : 1500,
      )
    },

    cancelUpload: () => {
      update((plan) => {
        plan.upload = null
      })
      const { plan, go } = get()
      if (!plan.hasResults) go(plan.financeSection != null ? 'P3' : 'P2')
    },

    typeInstead: () => {
      const { section, files } = get().plan.upload!
      update((plan) => {
        plan.missingDocs = [...(plan.missingDocs ?? []), ...files]
        plan.upload = null
        plan.entryMode[section] = 'type'
      })
      const index = FINANCE_SECTIONS.findIndex(({ id }) => id === section)
      if (index >= 0) get().openSection(index)
      else if (!get().plan.hasResults) get().go('P2')
    },

    correctReadValue: (field, text) =>
      update((plan) => {
        plan.upload!.edit[field] = parseWholeEuros(text) ?? 0
      }),

    addReadValues: () => {
      const upload = get().plan.upload!
      update((plan) => {
        confirmUpload(plan, upload)
        plan.upload = null
        if (upload.item) return
        plan.financeSection = null
        if (plan.hasResults && plan.tab === 'me') plan.mePage = 'money'
      })
      toast(upload.item ? 'Added from your document' : 'Added from your documents')
      if (!get().plan.hasResults) get().go(upload.item ? 'P3' : 'P2')
    },
  }
}
