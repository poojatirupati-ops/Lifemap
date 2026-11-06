import { isProfileComplete } from '../domain/discovery/profileQuestions.ts'
import { project } from '../domain/planning/project.ts'
import { EXTRA_MAX, EXTRA_MIN, leastCovered, stepSaving } from '../domain/planning/saving.ts'
import { planRules } from '../domain/planning/assumptionText.ts'
import { holdsSharesDirectly } from '../domain/planning/assumptions.ts'
import { GROWTH_KEYS, growthRate, settingsInUse } from '../domain/planning/settings.ts'
import { euro } from '../lib/format.ts'
import { toast } from './shell.ts'
import { useStore, type SetStore, type Store } from './store.ts'
import type { Plan, PlanSection, Ui } from './types.ts'
import { addVersion } from './versions.ts'
import { goTo } from '../shell/router.ts'

/** The original's Me page keys (still the buttons' data-p) whose URL under /me differs. */
const ME_PATHS: Record<string, string> = {
  asm: 'assumptions',
  um: 'profile',
  umr: 'profile/result',
}

const setName = (set: 'standard' | 'cautious') => (set === 'cautious' ? 'Cautious' : 'Standard')

/** What My Plan's buttons do: sections, goal edit, the results' links, saving and what-if. */
export function createPlanSlice(set: SetStore, get: () => Store) {
  const update = (recipe: (plan: Plan, ui: Ui) => void) => get().update(recipe)

  /** Close any sheet and open another page. */
  const leaveFor = (href: string) => {
    get().closeSheet()
    goTo(href)
  }

  /** The money profile's next page: its questions, the re-check of the first answers, or the result. */
  const profilePage = (plan: Plan) =>
    !isProfileComplete(plan)
      ? '/me/profile'
      : plan.moneyProfile.rechecked
        ? '/me/profile/result'
        : '/me/recheck'

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
    /** Your future at a glance: the journey road, life chapters or the year-by-year detail. */
    setResultsView: (view: Ui['resultsView']) => set({ resultsView: view }),
    /** Open a life chapter, or close it when it is already open. */
    toggleChapter: (index: number) =>
      set({ openChapter: get().openChapter === index ? null : index }),
    /** My Plan, scrolled to a section: 'timeline', 'results', 'wi' or 'fnd'. */
    showSection: (section: PlanSection) => {
      set({ planScrollTo: section })
      leaveFor('/plan')
    },
    /** The section has been scrolled to. */
    sectionShown: () => set({ planScrollTo: null }),
    openAddGoal: () => goTo('/plan/add'),
    toggleEditGoals: () =>
      update((_, ui) => {
        ui.editingGoals = !ui.editingGoals
        ui.highlightedGoal = null
      }),
    closeGoalEdit: () => set({ highlightedGoal: null }),
    /** A Me page by the original's key: 'privacy', 'asm', 'um', ... */
    openMe: (page: string) => leaveFor(`/me/${ME_PATHS[page] ?? page}`),
    /** A required choice is missing: open Your assumptions (at the top, no jump to the box). */
    fixChoice: () => leaveFor('/me/assumptions'),
    openProfile: () => {
      update((plan) => void (plan.moneyProfile.returnTo = 'plan'))
      leaveFor(profilePage(get().plan))
    },
    profilePage,
    bookAdviser: () => {
      update((plan) => void (plan.booking.from = 'plan'))
      goTo(isProfileComplete(get().plan) ? '/experts/c1' : '/experts/c0')
    },
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
        const rules = planRules(plan)
        for (const key of GROWTH_KEYS)
          plan.assumptions[key] = growthRate(
            key,
            set,
            settingsInUse(),
            rules,
            holdsSharesDirectly(plan),
          )
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

/** Before a plan exists, My money opens the plan builder, where the customer left it. */
export function makePlan() {
  useStore.getState().closeSheet()
  goTo(useStore.getState().builderAt ?? '/build/about')
}
