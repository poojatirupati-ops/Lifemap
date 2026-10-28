// Reading documents (a mock reader): scan, then confirm or fail.
import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import { confirmUpload, type Upload } from '../../domain/finances/upload.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'
import { openSection } from './financeActions.ts'

// TODO(R-19): upl as Upload and missingDocs belong in types.ts
type UploadPlan = Plan & { missingDocs?: string[] }
const update = (recipe: (plan: UploadPlan) => void) => useStore.getState().update(recipe)
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export const uploadOf = (plan: Plan) => plan.upl as Upload | null

/** Starts reading; a file named with "fail" shows the failure. */
export function startUpload(section: string, files: string[], item: Upload['item'] = null) {
  const upload: Upload = { sec: section, stage: 'scan', files, edit: {}, item }
  update((plan) => {
    plan.upl = upload
    if (!plan.app) return
    if (plan.tab === 'plan' || plan.tab === 'home') plan.tab = 'me'
    if (plan.tab === 'me') plan.me = 'fin'
    else plan.exp = 'fin'
  })
  const { plan, go, closeSheet } = useStore.getState()
  if (plan.app) closeSheet()
  else go('PU')
  const failed = files.some((file) => /fail/i.test(file))
  setTimeout(
    () =>
      update((plan) => {
        if (plan.upl) plan.upl.stage = failed ? 'fail' : 'confirm'
      }),
    reducedMotion() ? 200 : 1500,
  )
}

export function cancelUpload() {
  update((plan) => {
    plan.upl = null
  })
  const { plan, go } = useStore.getState()
  if (!plan.app) go(plan.fsec != null ? 'P3' : 'P2')
}

/** The document stays on the checklist and the section opens to type it in. */
export function typeInstead() {
  const { sec, files } = uploadOf(useStore.getState().plan)!
  update((plan) => {
    plan.missingDocs = [...(plan.missingDocs ?? []), ...files]
    plan.upl = null
    plan.fmode[sec] = 'type'
  })
  const index = FINANCE_SECTIONS.findIndex(({ id }) => id === sec)
  if (index >= 0) openSection(index)
  else if (!useStore.getState().plan.app) useStore.getState().go('P2')
}

/** A correction to a figure we read; it is still the document's figure. */
export const correctReadValue = (field: string, text: string) =>
  update((plan) => {
    uploadOf(plan)!.edit[field] = parseInt(text.replace(/\D/g, '')) || 0
  })

export function addReadValues() {
  const upload = uploadOf(useStore.getState().plan)!
  update((plan) => {
    confirmUpload(plan, upload)
    plan.upl = null
    if (upload.item) return
    plan.fsec = null
    if (plan.app && plan.tab === 'me') plan.me = 'money'
  })
  toast(upload.item ? 'Added from your document' : 'Added from your documents')
  const { plan, go } = useStore.getState()
  if (!plan.app) go(upload.item ? 'P3' : 'P2')
}
