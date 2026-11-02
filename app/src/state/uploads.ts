import { FINANCE_SECTIONS } from '../domain/finances/sections.data.ts'
import { confirmUpload, type DocumentRead, type Upload } from '../domain/finances/upload.ts'
import { prefersReducedMotion } from '../hooks/reducedMotion.ts'
import { parseWholeEuros } from '../lib/format.ts'
import { financesPath, show, updateFinances } from './finances.ts'
import { goTo } from '../shell/router.ts'
import type { SetStore, Store } from './store.ts'
import { toast } from './shell.ts'

export function createUploadsSlice(set: SetStore, get: () => Store) {
  const update = updateFinances(get)

  return {
    /** With `read` (uploaded and read by the API) straight to confirm, or fail when nothing was read; a sample named with "fail" shows the failure. */
    startUpload: (
      section: string,
      files: string[],
      item: Upload['item'] = null,
      read?: DocumentRead,
    ) => {
      const readStage =
        read && (read.failed || !Object.keys(read.fields).length ? 'fail' : 'confirm')
      update((_, ui) => {
        ui.upload = { section, stage: readStage || 'scan', files, edit: {}, item, read }
      })
      show(get, '/upload')
      if (readStage) return
      const stage = files.some((file) => /fail/i.test(file)) ? 'fail' : 'confirm'
      setTimeout(
        () =>
          update((_, ui) => {
            if (ui.upload) ui.upload.stage = stage
          }),
        prefersReducedMotion() ? 200 : 1500,
      )
    },

    // the page shown next clears the upload

    cancelUpload: () => {
      const { financeSection } = get()
      show(get, financeSection != null ? `/${financeSection + 1}` : '')
    },

    /** The document stays on the checklist and the section opens to type it in. */
    typeInstead: () => {
      const { section, files } = get().upload!
      update((plan, ui) => {
        plan.missingDocs = [...(plan.missingDocs ?? []), ...files]
        ui.upload = null
        plan.entryMode[section] = 'type'
      })
      const index = FINANCE_SECTIONS.findIndex(({ id }) => id === section)
      if (index >= 0) get().openSection(index)
      else show(get, '')
    },

    /** A correction to a figure we read; it is still the document's figure. */
    correctReadValue: (field: string, text: string) =>
      update((_, ui) => {
        ui.upload!.edit[field] = parseWholeEuros(text) ?? 0
      }),

    addReadValues: () => {
      const upload = get().upload!
      const { financeSection } = get()
      update((plan) => confirmUpload(plan, upload))
      toast(upload.item ? 'Added from your document' : 'Added from your documents')
      const next =
        upload.item && financeSection != null
          ? show(get, `/${financeSection + 1}`)
          : financesPath(get) === '/me/finances'
            ? goTo('/me/money')
            : show(get, '')
      void next.then(() => set({ upload: null }))
    },
  }
}

/** Reading documents: what the reader found (`read`), or a sample document's figures after a short scan. */
export type UploadActions = ReturnType<typeof createUploadsSlice>
