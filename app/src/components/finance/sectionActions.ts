// What a section of Your finances (P3) does.
import {
  answerMortgage,
  removeStatementFigures,
  typeFigure,
} from '../../domain/finances/figures.ts'
import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'
import { chooseRetireAge, retirementRange } from './choiceActions.ts'

const update = (recipe: (plan: Plan) => void) => useStore.getState().update(recipe)
const STATEMENT_REMOVED = 'Statement removed. Your own figures are used again'

// statement figures with no field of their own in the section
const HIDDEN_STATEMENT_FIGURES: Record<string, string[]> = {
  liab: ['cardRate', 'loanRate'],
  pension: ['penChg', 'spYears'],
}

/** Back from a section: to Check your details when it was opened from there, else Your finances. */
export function leaveSection() {
  const { plan, go } = useStore.getState()
  const fromCheck = plan.from === 'check'
  update((draft) => {
    draft.fsec = null
    if (fromCheck) draft.from = null
    else if (draft.app && draft.tab === 'me') draft.me = 'money'
  })
  if (!plan.app) go(fromCheck ? 'P4' : 'P2')
}

export function saveSection() {
  const section = FINANCE_SECTIONS[useStore.getState().plan.fsec!]
  update((plan) => {
    plan.saved[section.id] = true
    if (section.id === 'about' && plan.fin.name) plan.acct.name = plan.fin.name
  })
  toast(`${section.title} saved`)
  leaveSection()
}

export const chooseSectionMode = (mode: 'upload' | 'type') =>
  update((plan) => {
    plan.fmode[FINANCE_SECTIONS[plan.fsec!].id] = mode
  })

export function removeSectionStatement() {
  const section = FINANCE_SECTIONS[useStore.getState().plan.fsec!]
  update((plan) =>
    removeStatementFigures(plan, [
      ...section.fields,
      ...(HIDDEN_STATEMENT_FIGURES[section.id] ?? []),
    ]),
  )
  // TODO(R-28): also remove a pension statement uploaded from Explore (the original's pstRemove)
  toast(STATEMENT_REMOVED)
}

export const replaceSectionStatement = () => chooseSectionMode('upload')

/** A typed figure; age and retirement age also move the plan when they make sense. */
export function typeField(key: string, value: number | string | null) {
  let used = false
  update((plan) => {
    used = typeFigure(plan, key, value)
    if (used && key === 'age' && plan.fin.age >= 18) plan.about.age = plan.fin.age
  })
  const { plan } = useStore.getState()
  const { min, max } = retirementRange(plan)
  if (used && key === 'retireAge' && plan.fin.retireAge >= min && plan.fin.retireAge <= max) {
    chooseRetireAge(plan.fin.retireAge)
  }
}

export function chooseField(key: string, choice: string) {
  if (key === 'mortYN') {
    let used = true
    update((plan) => {
      used = answerMortgage(plan, choice as 'Yes' | 'No')
    })
    if (!used)
      toast('Your statement says how you own your home. Remove the statement to change it.')
    return
  }
  update((plan) => {
    typeFigure(plan, key, choice)
    if (key === 'home' && /^Own/.test(choice)) {
      delete plan.fin.mortYN
      delete plan.src.mortYN
    }
  })
}

export const openExample = (key: string) => useStore.getState().openSheet(`ex|${key}`)
