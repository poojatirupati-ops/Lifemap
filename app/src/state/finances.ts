import { mortgageAnswer } from '../domain/finances/fields.data.ts'
import { isFromStatement, removeStatementFigures, typeFigure } from '../domain/finances/figures.ts'
import { prepareSectionLists } from '../domain/finances/items.ts'
import { answerMortgage, chooseHome } from '../domain/finances/mortgage.ts'
import { prefillFinances } from '../domain/finances/prefill.ts'
import { FINANCE_SECTIONS, type FinanceSection } from '../domain/finances/sections.data.ts'
import { removeStatement } from '../domain/calc/statements.ts'
import { assumption } from '../domain/planning/assumptions.ts'
import { rulesFor } from '../domain/planning/rates.ts'
import { missingChoices } from '../domain/planning/requiredChoices.ts'
import { requiredFields } from '../components/finance/status.ts'
import { prefersReducedMotion } from '../hooks/reducedMotion.ts'
import { addVersion } from './versions.ts'
import { normalize } from '../domain/plan/normalize.ts'
import { chooseRetireAge } from './choices.ts'
import { retirementRange } from '../domain/goals/retirement.ts'
import { toast } from './shell.ts'
import { currentArea, goTo } from '../shell/router.ts'
import { useStore, type Store } from './store.ts'
import { redirect } from '@tanstack/react-router'
import type { Plan, Ui } from './types.ts'

export const STATEMENT_REMOVED = 'Statement removed. Your own figures are used again'

// statement figures with no field of their own in the section
const HIDDEN_STATEMENT_FIGURES: Record<string, string[]> = {
  liab: ['cardRate', 'loanRate'],
  pension: ['penChg', 'spYears'],
}

/** The open section of Your finances (P3), if any. */
export const currentSection = ({ financeSection }: Pick<Ui, 'financeSection'>) =>
  financeSection == null ? null : FINANCE_SECTIONS[financeSection]

/** Upload when the section can take documents and the customer chose it, else Type it. */
export function sectionMode(plan: Pick<Plan, 'entryMode'>, ui: Pick<Ui, 'financeSection'>) {
  const section = currentSection(ui)
  if (!section?.documents.length) return 'type'
  return plan.entryMode[section.id] === 'upload' ? 'upload' : 'type'
}

/**
 * The store's update, after which the open section's lists are ready (legacy totals moved in, a
 * starter item) whenever they show. The totals the lists fed are refreshed first, so a list just
 * emptied does not take its old total back.
 */
export const updateFinances = (get: () => Store) => (recipe: (plan: Plan, ui: Ui) => void) =>
  get().update((plan, ui) => {
    recipe(plan, ui)
    const section = currentSection(ui)
    if (!section || ui.upload || sectionMode(plan, ui) !== 'type') return
    normalize(plan)
    prepareSectionLists(plan, section.id)
  })

/** Where Your finances lives: in the plan builder, or in the app under Experts (when opened there) or Me. */
export function financesPath(get: () => Store) {
  if (!get().plan.hasResults) return '/build/finances'
  return currentArea() === 'experts' ? '/experts/finances' : '/me/finances'
}

/**
 * What a page of Your finances shows, set by its route (routes/_auth/build/finances and its twins under Me and
 * Experts): the hub, a section ('1' to '6'), or the documents being read. A page that cannot show sends to the hub.
 */
export function financesPage(hub: string, page: { section?: string; upload?: boolean } = {}) {
  const store = useStore.getState()
  if (page.upload) {
    if (!store.upload) throw redirect({ href: hub })
    return
  }
  const index = page.section == null ? null : Number(page.section) - 1
  if (index != null && !FINANCE_SECTIONS[index]) throw redirect({ href: hub })
  updateFinances(useStore.getState)((_, ui) => {
    ui.financeSection = index
    ui.upload = null
  })
}

/** Closes any sheet and opens a page of Your finances: '' (the hub), a section ('/2') or '/upload'. */
export function show(get: () => Store, page: string) {
  get().closeSheet()
  return goTo(financesPath(get) + page)
}

export function createFinancesSlice(get: () => Store) {
  const update = updateFinances(get)

  return {
    // the section's route (routes/_auth/build/finances/$section.tsx and its twins) sets financeSection
    openSection: (index: number) => show(get, `/${index + 1}`),

    /** Back to Check your details when the section was opened from there, else Your finances. */
    leaveSection: () => {
      const fromCheck = get().cameFrom === 'check'
      if (fromCheck) update((_, ui) => void (ui.cameFrom = null))
      const path = financesPath(get)
      if (fromCheck) goTo('/build/check')
      else goTo(path === '/me/finances' ? '/me/money' : path)
    },

    saveSection: () => {
      const section = currentSection(get())!
      update((plan) => {
        plan.savedSections[section.id] = true
        if (section.id === 'about' && plan.figures.name) plan.account.name = plan.figures.name
      })
      toast(`${section.title} saved`)
      get().leaveSection()
    },

    chooseSectionMode: (mode: 'upload' | 'type') =>
      update((plan, ui) => {
        plan.entryMode[currentSection(ui)!.id] = mode
      }),

    // an Explore statement none of whose figures are left goes too (the original's pstRemove)

    removeSectionStatement: () => {
      const section = currentSection(get())!
      const keys = [...section.fields, ...(HIDDEN_STATEMENT_FIGURES[section.id] ?? [])]
      const rules = rulesFor(assumption(get().plan, 'startYear'))
      update((plan) => {
        removeStatementFigures(plan, keys)
        const used = new Set(Object.values(plan.documentOf))
        for (const cat of Object.keys(plan.statements))
          if (!used.has(`pst:${cat}`)) removeStatement(plan, plan, cat, rules)
      })
      toast(STATEMENT_REMOVED)
    },

    /** A typed figure; age and retirement age also move the plan when they make sense. */
    typeField: (key: string, value: number | string | null) => {
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

    chooseField: (key: string, choice: string) => {
      update((plan) => {
        if (key === 'mortYN') answerMortgage(plan, choice as 'Yes' | 'No')
        else if (key === 'home') chooseHome(plan, choice)
        else typeFigure(plan, key, choice)
      })
      if (key === 'mortYN' && mortgageAnswer(get().plan) !== choice) {
        toast('Your statement says how you own your home. Remove the statement to change it.')
      }
    },

    toggleCredit: (key: string) =>
      update(
        (plan) =>
          void (plan.about.taxCredits = {
            ...plan.about.taxCredits,
            [key]: !plan.about.taxCredits?.[key],
          }),
      ),
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

// What Your finances (P2), Check your details (P4) and Building your plan (U1) do.

/** From Check your details: the section's Back returns to the check. */
export function fixSection(index: number) {
  useStore.getState().update((plan, ui) => {
    if (!plan.hasResults) ui.cameFrom = 'check'
  })
  useStore.getState().openSection(index)
}

export const leaveForAdviser = (key: string) =>
  useStore.getState().update((plan) => void (plan.acknowledged[key] = true))

export const leaveSectionForAdviser = (section: FinanceSection) =>
  useStore.getState().update((plan) => {
    for (const key of requiredFields(section, plan)) plan.acknowledged[key] = true
  })

/** Back to the Me tab's hub (or the Experts tab's home, for Your finances opened there). */
export const backToMe = () => goTo(currentArea() === 'experts' ? '/experts' : '/me')

/** Shows Building your plan, then opens the results in My Plan. */
export const seeResults = () => showResults(true)
export const skipResults = () => showResults(false)

function showResults(checked: boolean) {
  if (missingChoices(useStore.getState().plan).length) return
  useStore.getState().update((plan) => void (plan.checked = checked))
  goTo('/build/results')
  setTimeout(
    () => {
      useStore.getState().update((plan, ui) => {
        plan.hasResults = true
        ui.planBuilder = false
        ui.planScrollTo = 'results'
        if (!plan.versions.some(({ note }) => /results/.test(note)))
          addVersion(plan, 'First results')
      })
      goTo('/plan', true) // the loader is not a page to come back to
    },
    prefersReducedMotion() ? 300 : 1400,
  )
}

/** What a section of Your finances (P3) does. */
export type FinancesActions = ReturnType<typeof createFinancesSlice>
