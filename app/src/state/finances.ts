import { mortgageAnswer } from '../domain/finances/fields.data.ts'
import { isFromStatement, removeStatementFigures, typeFigure } from '../domain/finances/figures.ts'
import { prepareSectionLists } from '../domain/finances/items.ts'
import { answerMortgage, chooseHome } from '../domain/finances/mortgage.ts'
import { prefillFinances } from '../domain/finances/prefill.ts'
import { FINANCE_SECTIONS } from '../domain/finances/sections.data.ts'
import { normalize } from '../domain/plan/normalize.ts'
// TODO(R-18): R-18's step-7 choice (chooseRetireAge) moves to domain/planning
// and a planning slice; then import them from there.
import { chooseRetireAge } from '../components/finance/choiceActions.ts'
import { retirementRange } from '../domain/goals/retirement.ts'
import { toast } from './shell.ts'
import type { Plan } from './types.ts'

export const STATEMENT_REMOVED = 'Statement removed. Your own figures are used again'

// statement figures with no field of their own in the section
const HIDDEN_STATEMENT_FIGURES: Record<string, string[]> = {
  liab: ['cardRate', 'loanRate'],
  pension: ['penChg', 'spYears'],
}

/** The open section of Your finances (P3), if any. */
export const currentSection = (plan: Pick<Plan, 'financeSection'>) =>
  plan.financeSection == null ? null : FINANCE_SECTIONS[plan.financeSection]

/** Upload when the section can take documents and the customer chose it, else Type it. */
export function sectionMode(plan: Pick<Plan, 'financeSection' | 'entryMode'>) {
  const section = currentSection(plan)
  if (!section?.documents.length) return 'type'
  return plan.entryMode[section.id] === 'upload' ? 'upload' : 'type'
}

export interface StoreCore {
  plan: Plan
  update: (recipe: (plan: Plan) => void) => void
  go: (screen: string) => void
  closeSheet: () => void
}

/**
 * The store's update, after which the open section's lists are ready (legacy totals moved in, a
 * starter item) whenever they show. The totals the lists fed are refreshed first, so a list just
 * emptied does not take its old total back.
 */
export const updateFinances = (get: () => StoreCore) => (recipe: (plan: Plan) => void) =>
  get().update((plan) => {
    recipe(plan)
    const section = currentSection(plan)
    if (!section || plan.upload || sectionMode(plan) !== 'type') return
    normalize(plan)
    prepareSectionLists(plan, section.id)
  })

/** Leaves for a flow screen, or in the app closes the sheet over the page just changed. */
export function show(get: () => StoreCore, screen: string) {
  if (get().plan.hasResults) get().closeSheet()
  else get().go(screen)
}

/** What a section of Your finances (P3) does. */
export interface FinancesActions {
  openSection: (index: number) => void
  /** Back to Check your details when the section was opened from there, else Your finances. */
  leaveSection: () => void
  saveSection: () => void
  chooseSectionMode: (mode: 'upload' | 'type') => void
  removeSectionStatement: () => void
  /** A typed figure; age and retirement age also move the plan when they make sense. */
  typeField: (key: string, value: number | string | null) => void
  chooseField: (key: string, choice: string) => void
  toggleCredit: (key: string) => void
}

export function createFinancesSlice(get: () => StoreCore & FinancesActions): FinancesActions {
  const update = updateFinances(get)

  return {
    openSection: (index) => {
      update((plan) => {
        plan.financeSection = index
        plan.upload = null
        if (plan.hasResults && plan.tab !== 'exp') {
          plan.tab = 'me'
          plan.mePage = 'fin'
        }
      })
      show(get, 'P3')
    },

    leaveSection: () => {
      const fromCheck = get().plan.cameFrom === 'check'
      update((plan) => {
        plan.financeSection = null
        if (fromCheck) plan.cameFrom = null
        else if (plan.hasResults && plan.tab === 'me') plan.mePage = 'money'
      })
      if (!get().plan.hasResults) get().go(fromCheck ? 'P4' : 'P2')
    },

    saveSection: () => {
      const section = currentSection(get().plan)!
      update((plan) => {
        plan.savedSections[section.id] = true
        if (section.id === 'about' && plan.figures.name) plan.account.name = plan.figures.name
      })
      toast(`${section.title} saved`)
      get().leaveSection()
    },

    chooseSectionMode: (mode) =>
      update((plan) => {
        plan.entryMode[currentSection(plan)!.id] = mode
      }),

    removeSectionStatement: () => {
      const section = currentSection(get().plan)!
      const keys = [...section.fields, ...(HIDDEN_STATEMENT_FIGURES[section.id] ?? [])]
      update((plan) => removeStatementFigures(plan, keys))
      // TODO(R-28): also remove a pension statement uploaded from Explore (the original's pstRemove)
      toast(STATEMENT_REMOVED)
    },

    typeField: (key, value) => {
      // a statement figure stays in use; the typed one is kept for later
      const used = !isFromStatement(get().plan, key)
      update((plan) => {
        typeFigure(plan, key, value)
        if (used && key === 'age' && plan.figures.age >= 18) plan.about.age = plan.figures.age
      })
      const { plan } = get()
      const { min, max } = retirementRange(plan)
      const age = plan.figures.retireAge
      if (used && key === 'retireAge' && age >= min && age <= max) chooseRetireAge(age)
    },

    chooseField: (key, choice) => {
      update((plan) => {
        if (key === 'mortYN') answerMortgage(plan, choice as 'Yes' | 'No')
        else if (key === 'home') chooseHome(plan, choice)
        else typeFigure(plan, key, choice)
      })
      if (key === 'mortYN' && mortgageAnswer(get().plan) !== choice) {
        toast('Your statement says how you own your home. Remove the statement to change it.')
      }
    },

    toggleCredit: (key) =>
      update((plan) => {
        plan.about.taxCredits = { ...plan.about.taxCredits, [key]: !plan.about.taxCredits?.[key] }
      }),
  }
}

/** Starts Your finances from what the customer already told us, inside an update recipe. */
export function fillKnownFinances(plan: Plan) {
  const known = prefillFinances({
    name: plan.account.name,
    age: plan.about.age,
    retireAge: plan.retireAge,
    retireSet: plan.retireSet,
  })
  for (const [field, value] of Object.entries(known)) {
    plan.figures[field] = value
    plan.sources[field] ||= 'pre'
  }
}
