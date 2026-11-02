import { isProfileComplete } from '../domain/discovery/profile.ts'
import { project } from '../domain/planning/project.ts'
import { EXTRA_MAX, EXTRA_MIN, leastCovered, stepSaving } from '../domain/planning/saving.ts'
import { GROWTH_KEYS, growthRate } from '../domain/planning/settings.ts'
import { euro } from '../lib/format.ts'
import { toast } from './shell.ts'
import type { SetStore, Store } from './store.ts'
import type { Plan, PlanSection, Ui } from './types.ts'
import { addVersion } from './versions.ts'

const setName = (set: 'standard' | 'cautious') => (set === 'cautious' ? 'Cautious' : 'Standard')

/** What My Plan's buttons do: sections, goal edit, the results' links, saving and what-if. */
export function createPlanSlice(set: SetStore, get: () => Store) {
  const update = (recipe: (plan: Plan, ui: Ui) => void) => get().update(recipe)

  /** Leave for another tab's page and close any sheet. */
  const leaveFor = (recipe: (plan: Plan, ui: Ui) => void) => {
    update(recipe)
    get().closeSheet()
  }

  /** Change the what-if; the first change picks the least-covered goal. */
  const changeWhatIf = (change: (whatIf: Plan['whatIf']) => void) => {
    const { plan } = get()
    const percent = plan.whatIf.goalId == null ? project(plan).percent : {}
    update((draft) => {
      draft.whatIf.goalId ??= leastCovered(draft.goals, percent)?.id ?? null
      change(draft.whatIf)
    })
  }

  return {
    /** My Plan, scrolled to a section: 'timeline', 'results', 'wi' or 'fnd'. */
    showSection: (section: PlanSection) =>
      set({ tab: 'plan', planSegment: 'main', planScrollTo: section, sheet: null }),
    /** The section has been scrolled to. */
    sectionShown: () => set({ planScrollTo: null }),
    openAddGoal: () => set({ planSegment: 'add' }),
    toggleEditGoals: () =>
      update((_, ui) => {
        ui.editingGoals = !ui.editingGoals
        ui.highlightedGoal = null
      }),
    closeGoalEdit: () => set({ highlightedGoal: null }),
    openMe: (page: string) => set({ tab: 'me', mePage: page, sheet: null }),
    /** A required choice is missing: open Your assumptions (at the top, no jump to the box). */
    fixChoice: () => set({ tab: 'me', mePage: 'asm', sheet: null }),
    openProfile: () =>
      leaveFor((plan, ui) => {
        plan.moneyProfile.returnTo = 'plan'
        ui.tab = 'me'
        if (!isProfileComplete(plan)) ui.mePage = 'um'
        else ui.mePage = plan.moneyProfile.rechecked ? 'umr' : 'recheck'
      }),
    bookAdviser: () =>
      update((plan, ui) => {
        ui.tab = 'exp'
        ui.expertsPage = isProfileComplete(plan) ? 'c1' : 'c0'
        plan.booking.from = 'plan'
      }),
    markUnderstood: () =>
      update((plan) => {
        plan.understood = true
        addVersion(plan, 'Results understood')
      }),
    toggleAdviserQuestion: (question: string) =>
      update((plan) => {
        const index = plan.adviserQuestions.indexOf(question)
        if (index >= 0) plan.adviserQuestions.splice(index, 1)
        else plan.adviserQuestions.push(question)
      }),
    chooseAssumptions: (set: 'standard' | 'cautious') => {
      update((plan) => {
        plan.assumptionSet = set
        for (const key of GROWTH_KEYS) plan.assumptions[key] = growthRate(key, set)
        addVersion(plan, `Growth assumptions: ${setName(set)}`)
      })
      toast(`${setName(set)} assumptions: results updated`)
    },
    /** The −/+ buttons on Your saving today. */
    stepSavingBy: (change: number) => {
      const { saving } = project(get().plan)
      update((plan) => {
        const current = plan.monthlySaving ?? saving.savingMonthly
        const { amount, capped } = stepSaving(current, change, saving.spareMonthly)
        plan.savingAtRule = amount >= saving.ruleMonthly - 0.5
        plan.savingCapped = capped
        plan.monthlySaving = amount
      })
    },
    typeSaving: (amount: number) =>
      update((plan) => {
        plan.monthlySaving = amount
        plan.savingCapped = false
      }),
    resetSaving: () =>
      update((plan) => {
        plan.monthlySaving = null
        plan.savingCapped = false
      }),
    pickWhatIfGoal: (id: number) => update((plan) => void (plan.whatIf.goalId = id)),
    stepExtra: (change: number) =>
      changeWhatIf(
        (whatIf) =>
          void (whatIf.monthlyExtra = Math.min(
            EXTRA_MAX,
            Math.max(EXTRA_MIN, whatIf.monthlyExtra + change),
          )),
      ),
    setExtra: (amount: number) => changeWhatIf((whatIf) => void (whatIf.monthlyExtra = amount)),
    setLumpSum: (amount: number) => changeWhatIf((whatIf) => void (whatIf.lumpSum = amount)),
    saveWhatIf: () => {
      update((plan) => {
        const { goalId, monthlyExtra, lumpSum } = plan.whatIf
        plan.preferredWhatIf = { ...plan.whatIf }
        const extra = monthlyExtra
          ? `${monthlyExtra > 0 ? '+' : ''}${euro(monthlyExtra)}/month `
          : ''
        const once = lumpSum ? `+${euro(lumpSum)} once` : ''
        const goal = plan.goals.find((each) => each.id === goalId)
        addVersion(plan, `Preferred plan: ${extra}${once}${goal ? ` → ${goal.name}` : ''}`)
      })
      toast(`Saved as your preferred plan (version ${get().plan.versions.length})`)
    },
    resetWhatIf: () => {
      update((plan) => {
        plan.whatIf.monthlyExtra = 0
        plan.whatIf.lumpSum = 0
      })
      toast('Back to your plan')
    },
  }
}

export type PlanActions = ReturnType<typeof createPlanSlice>
