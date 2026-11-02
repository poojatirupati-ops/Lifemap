import { isProfileComplete } from '../domain/discovery/profile.ts'
import { project } from '../domain/planning/project.ts'
import { EXTRA_MAX, EXTRA_MIN, leastCovered, stepSaving } from '../domain/planning/saving.ts'
import { GROWTH_KEYS, growthRate } from '../domain/planning/settings.ts'
import { euro } from '../lib/format.ts'
import { toast } from './shell.ts'
import type { Plan, PlanSection } from './types.ts'
import { addVersion } from './versions.ts'

interface StoreCore {
  plan: Plan
  update: (recipe: (plan: Plan) => void) => void
  closeSheet: () => void
}

const setName = (set: 'standard' | 'cautious') => (set === 'cautious' ? 'Cautious' : 'Standard')

/** What My Plan's buttons do: sections, goal edit, the results' links, saving and what-if. */
export function createPlanSlice(get: () => StoreCore) {
  const update = (recipe: (plan: Plan) => void) => get().update(recipe)

  /** Leave for another tab's page and close any sheet. */
  const leaveFor = (recipe: (plan: Plan) => void) => {
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
      leaveFor((plan) => {
        plan.tab = 'plan'
        plan.planSegment = 'main'
        plan.planScrollTo = section
      }),
    /** The section has been scrolled to. */
    sectionShown: () =>
      update((plan) => {
        plan.planScrollTo = null
      }),
    openAddGoal: () =>
      update((plan) => {
        plan.planSegment = 'add'
      }),
    toggleEditGoals: () =>
      update((plan) => {
        plan.editingGoals = !plan.editingGoals
        plan.highlightedGoal = null
      }),
    closeGoalEdit: () =>
      update((plan) => {
        plan.highlightedGoal = null
      }),
    openMe: (page: string) =>
      leaveFor((plan) => {
        plan.tab = 'me'
        plan.mePage = page
      }),
    /** A required choice is missing: open Your assumptions (at the top, no jump to the box). */
    fixChoice: () =>
      leaveFor((plan) => {
        plan.tab = 'me'
        plan.mePage = 'asm'
      }),
    openProfile: () =>
      leaveFor((plan) => {
        plan.moneyProfile.returnTo = 'plan'
        plan.tab = 'me'
        if (!isProfileComplete(plan)) plan.mePage = 'um'
        else plan.mePage = plan.moneyProfile.rechecked ? 'umr' : 'recheck'
      }),
    bookAdviser: () =>
      update((plan) => {
        plan.tab = 'exp'
        plan.expertsPage = isProfileComplete(plan) ? 'c1' : 'c0'
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
    pickWhatIfGoal: (id: number) =>
      update((plan) => {
        plan.whatIf.goalId = id
      }),
    stepExtra: (change: number) =>
      changeWhatIf((whatIf) => {
        whatIf.monthlyExtra = Math.min(EXTRA_MAX, Math.max(EXTRA_MIN, whatIf.monthlyExtra + change))
      }),
    setExtra: (amount: number) =>
      changeWhatIf((whatIf) => {
        whatIf.monthlyExtra = amount
      }),
    setLumpSum: (amount: number) =>
      changeWhatIf((whatIf) => {
        whatIf.lumpSum = amount
      }),
    saveWhatIf: () => {
      update((plan) => {
        const { goalId: g, monthlyExtra: m, lumpSum: l } = plan.whatIf
        plan.preferredWhatIf = { ...plan.whatIf }
        const extra = m ? `${m > 0 ? '+' : ''}${euro(m)}/month ` : ''
        const once = l ? `+${euro(l)} once` : ''
        const goal = plan.goals.find((each) => each.id === g)
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
