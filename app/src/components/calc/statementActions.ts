// Explore statement uploads: secure the account first, read (mock), confirm, remove.
// TODO(Q-01): move into an explore slice in src/state once the store has per-context slices.
import { rerender, toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import { calcContext, type CalcPlan } from './context.ts'
import {
  confirmStatement,
  defaultFiles,
  removeStatement,
  type StatementUpload,
} from './statements.ts'
import { STATEMENT_KINDS } from './statements.data.ts'

const store = () => useStore.getState()
const update = (recipe: (plan: CalcPlan) => void) => store().update(recipe)
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const rulesOf = (plan: CalcPlan) => calcContext(plan, 'retirement').rules

export const uploadOf = (plan: CalcPlan) => plan.pst as StatementUpload | null

/** Upload a statement (or use the sample one). Documents need a secured account first. */
export function startStatement(cat: string, files = defaultFiles(cat)) {
  const { plan, screen } = store()
  if (!(plan.acct.ev && plan.acct.sv)) {
    update((draft) => {
      draft.after = { k: 'pst', cat, files, scr: screen }
      draft.xs.push({ v: 'ACCT' })
    })
    store().go('P1')
    rerender()
    return
  }
  update((draft) => {
    draft.pst = { cat, stage: 'scan', files, edit: {} } satisfies StatementUpload
    draft.xs = draft.xs.filter(({ v }) => v !== 'ACCT' && v !== 'PST')
    draft.xs.push({ v: 'PST' })
  })
  rerender()
  setTimeout(
    () => {
      if (uploadOf(store().plan)?.stage !== 'scan') return
      update((draft) => void (uploadOf(draft)!.stage = 'confirm'))
    },
    reducedMotion() ? 200 : 1400,
  )
}

/** The customer corrects a figure we read (kept as typed until they confirm). */
export const correctFigure = (key: string, text: string) =>
  update((plan) => {
    const upload = uploadOf(plan)
    if (upload) upload.edit[key] = text
  })

/** "Looks right, fill in my tools": on to the tool the statement fills in. */
export function confirmUpload() {
  const upload = uploadOf(store().plan)
  if (!upload) return
  let where = ''
  update((plan) => {
    where = confirmStatement(plan, upload, rulesOf(plan))
    plan.pst = null
    plan.xs = [
      { v: 'XCAT', p: upload.cat },
      { v: 'CALC', p: STATEMENT_KINDS[upload.cat].opens },
    ]
  })
  rerender()
  toast(
    store().plan.app
      ? `Added to your plan too (${where})`
      : 'Saved. Your plan will use it when you make it',
  )
}

export function removeUploadedStatement(cat: string) {
  update((plan) => removeStatement(plan, cat, rulesOf(plan)))
  toast('Statement removed. Your own figures are used again')
}
