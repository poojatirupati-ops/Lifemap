// What My Plan's buttons do (timeline edits, the results' links, saving and what-if).
// TODO(Q-01): move into a plan slice in src/state once the store has per-context slices.
import { fundingOrder } from '../../domain/planning/fund.ts'
import { moneyProfileAnswered } from '../../domain/discovery/profile.ts'
import { project } from '../../domain/planning/project.ts'
import { cautiousValue, standardValue } from '../../domain/planning/settings.ts'
import { euro } from '../../lib/format.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'
import { leastCovered, stepSaving } from './saving.ts'

// TODO(R-23): saveUp and um.rechecked/ret are in the original's state but not yet in Plan (R-02 owns types.ts)
type Draft = Plan & { saveUp?: boolean; um: Plan['um'] & { rechecked?: boolean; ret?: string } }

const store = () => useStore.getState()
const update = (recipe: (plan: Draft) => void) => store().update((plan) => recipe(plan as Draft))
const addVersion = (plan: Plan, note: string) => plan.versions.push({ note, date: '29 Sep 2026' })
const profileAnswered = (plan: Plan) =>
  moneyProfileAnswered({ discover: plan.ans, money: plan.um.a, products: plan.um.chips })

/** My Plan, scrolled to a section: 'timeline', 'results', 'wi' or 'fnd'. */
export function showSection(section: string) {
  update((plan) => {
    plan.tab = 'plan'
    plan.planSeg = 'main'
    plan.planGo = section
  })
  store().closeSheet()
}

export const openAddGoal = () => update((plan) => void (plan.planSeg = 'add'))

export const toggleEditGoals = () =>
  update((plan) => {
    plan.planEdit = !plan.planEdit
    plan.tlHl = null
  })

export const closeGoalEdit = () => update((plan) => void (plan.tlHl = null))

export function openMe(page: string) {
  update((plan) => {
    plan.tab = 'me'
    plan.me = page
  })
  store().closeSheet()
}

/** A required choice is missing: open Your assumptions. */
export const fixChoice = () => {
  // ponytail: no jump-and-flash to the box; Your assumptions (R-26) opens at the top
  update((plan) => void Object.assign(plan, { tab: 'me', me: 'asm' }))
  store().closeSheet()
}

export function openProfile() {
  update((plan) => {
    const complete = profileAnswered(plan) === 13
    plan.um.ret = 'plan'
    plan.tab = 'me'
    plan.me = complete ? (plan.um.rechecked ? 'umr' : 'recheck') : 'um'
  })
  store().closeSheet()
}

export function bookAdviser() {
  update((plan) => {
    plan.tab = 'exp'
    plan.exp = profileAnswered(plan) < 13 ? 'c0' : 'c1'
    plan.book.from = 'plan'
  })
}

export const markUnderstood = () =>
  update((plan) => {
    plan.understood = true
    addVersion(plan, 'Results understood')
  })

export const toggleAdviserQuestion = (question: string) =>
  update((plan) => {
    const index = plan.advQs.indexOf(question)
    if (index >= 0) plan.advQs.splice(index, 1)
    else plan.advQs.push(question)
  })

export function chooseAssumptions(set: 'standard' | 'cautious') {
  const valueOf = set === 'cautious' ? cautiousValue : standardValue
  update((plan) => {
    plan.assume = set
    for (const key of ['wage', 'cash', 'inv', 'pen', 'penRet'] as const)
      plan.asm[key] = valueOf(key) as number
    addVersion(plan, `Growth assumptions: ${set === 'cautious' ? 'Cautious' : 'Standard'}`)
  })
  toast(`${set === 'cautious' ? 'Cautious' : 'Standard'} assumptions: results updated`)
}

/** The −/+ buttons on Your saving today. */
export function stepSavingBy(change: number) {
  const { saving } = project(store().plan)
  update((plan) => {
    const current = plan.saveM ?? saving.savingMonthly
    const { amount, capped } = stepSaving(current, change, saving.spareMonthly)
    plan.saveUp = amount >= saving.ruleMonthly - 0.5
    plan.saveNote = capped
      ? "That's all of your spare money each month, so we can't count more than this. "
      : ''
    plan.saveM = amount
  })
}

export const typeSaving = (amount: number) =>
  update((plan) => {
    plan.saveM = amount
    plan.saveNote = ''
  })

export const resetSaving = () =>
  update((plan) => {
    plan.saveM = null
    plan.saveNote = ''
  })

/** Change the what-if; the first change picks the least-covered goal. */
function changeWhatIf(change: (wi: Plan['wi']) => void) {
  const percent = store().plan.wi.g == null ? project(store().plan).percent : {}
  update((plan) => {
    plan.wi.g ??= leastCovered(plan.goals, percent)?.id ?? null
    change(plan.wi)
  })
}

export const pickWhatIfGoal = (id: number) => update((plan) => void (plan.wi.g = id))
export const stepExtra = (change: number) =>
  changeWhatIf((wi) => void (wi.m = Math.min(10000, Math.max(-5000, wi.m + change))))
export const setExtra = (amount: number) => changeWhatIf((wi) => void (wi.m = amount))
export const setLumpSum = (amount: number) => changeWhatIf((wi) => void (wi.l = amount))

export function saveWhatIf() {
  update((plan) => {
    const { g, m, l } = plan.wi
    plan.pref = { ...plan.wi }
    const extra = m ? `${m > 0 ? '+' : ''}${euro(m)}/month ` : ''
    const once = l ? `+${euro(l)} once` : ''
    const goal = plan.goals.find((each) => each.id === g)
    addVersion(plan, `Preferred plan: ${extra}${once}${goal ? ` → ${goal.name}` : ''}`)
  })
  toast(`Saved as your preferred plan (version ${store().plan.versions.length})`)
}

export function resetWhatIf() {
  update((plan) => void (plan.wi = { g: plan.wi.g, m: 0, l: 0 }))
  toast('Back to your plan')
}

/** A goal dragged from one place in "Which goal first?" to another; returns the status line. */
export function rankGoal(from: number, to: number) {
  const order = fundingOrder(store().plan.goals, store().plan.rank)
  const [moved] = order.splice(from, 1)
  order.splice(to, 0, moved)
  update((plan) => {
    plan.rank = order.map((goal) => goal.id)
    addVersion(plan, 'Goal priority changed')
  })
  return `${moved.name} is now ${to + 1} of ${order.length}`
}
