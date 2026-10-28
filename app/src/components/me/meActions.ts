// What the Me tab's buttons do.
// TODO(Q-01): move into an identity slice in src/state once the store has per-context slices.
import { postConsents } from '../../auth/planSync.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import { cushion } from '../../domain/discovery/cushion.ts'
import { suggestedHorizon } from '../../domain/discovery/profile.ts'
import { MONEY_PROFILE } from '../../domain/discovery/questions.data.ts'
import { riskLabelText, riskRead } from '../../domain/discovery/riskRead.ts'
import type { Plan } from '../../state/types.ts'
import { suggestedHorizonFor } from '../define/profileActions.ts'
import { PROFILE_QUESTIONS, profileAnswered, updateMe } from './mePlan.ts'

const PLAN_BUILDER_SCREENS = /^(B1|F1|F2|F4|B4|P1|P1E|P1S|P1K|P2|P3|PU|P4)$/
const AVATAR_SIZE = 240

/** Your full money profile from the Me tab: the result, the re-check, or the questions. */
export function toProfile() {
  updateMe((plan) => {
    const complete = profileAnswered(plan) === PROFILE_QUESTIONS
    plan.me = complete ? (plan.um.rechecked ? 'umr' : 'recheck') : 'um'
  })
}

/** Before a plan exists, My money opens the plan builder. */
export function makePlan() {
  const { screen, go } = useStore.getState()
  updateMe((plan) => {
    plan.tab = 'plan'
    plan.pb = true
  })
  go(PLAN_BUILDER_SCREENS.test(screen) ? screen : 'B1')
}

/** Leave the profile for where the customer came from: My Plan's results or the adviser meeting. */
export function returnFromProfile(to: string) {
  updateMe((plan) => {
    plan.um.ret = null
    plan.tab = to
    if (to === 'exp') plan.exp = 'home'
    else {
      plan.planSeg = 'main'
      plan.planGo = 'results'
    }
  })
}

export function continueToAdviserMatch() {
  updateMe((plan) => {
    plan.um.ret = null
    plan.tab = 'exp'
    plan.exp = 'c1'
  })
}

export const confirmFirstAnswers = () => {
  updateMe((plan) => {
    plan.um.rechecked = true
    plan.meEdit = {}
    plan.me = 'home'
  })
  toast('Thanks. Your first answers are confirmed')
}

/** Reminders are optional: switching them off is recorded as easily as switching them on. */
export function setReminders(on: boolean) {
  updateMe((plan) => void (plan.acct.c2 = on))
  void postConsents({ terms: true, marketing: on })
}

export const toggleAdviserQuestion = (question: string) =>
  updateMe((plan) => {
    plan.advQs = plan.advQs.includes(question)
      ? plan.advQs.filter((q) => q !== question)
      : [...plan.advQs, question]
  })

/** A square, centre-cropped JPEG of the chosen picture becomes the profile photo. */
export function changePhoto(file: File | undefined) {
  if (!file) return
  if (!file.type.startsWith('image/')) return toast('Please choose an image')
  const image = new Image()
  const url = URL.createObjectURL(file)
  image.onload = () => {
    const side = Math.min(image.width, image.height)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = AVATAR_SIZE
    const left = (image.width - side) / 2
    const top = (image.height - side) / 2
    canvas.getContext('2d')!.drawImage(image, left, top, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE)
    URL.revokeObjectURL(url)
    updateMe((plan) => void (plan.acct.photo = canvas.toDataURL('image/jpeg', 0.85)))
    toast('Photo updated')
  }
  image.src = url
}

export const openProfileSection = (step: number) =>
  updateMe((plan) => {
    plan.um.sec = step
    plan.me = 'ums'
  })

const confirmedRiskLabel = (plan: Plan) =>
  riskLabelText(
    riskRead(
      { discover: plan.ans, money: plan.um.a, products: plan.um.chips },
      {
        complete: true,
        cushion: cushion(plan),
        suggestedHorizon: suggestedHorizon(plan.goals, plan.about.age ?? 0, plan.retireAge),
      },
    ),
  )

/** Save one money-profile section; an unanswered horizon takes the timeline's suggestion. */
export function saveProfileSection() {
  const section = MONEY_PROFILE.find(({ step }) => step === useStore.getState().plan.um.sec)!
  updateMe((plan) => {
    const asksHorizon = section.questions.some(
      (entry) => typeof entry !== 'string' && entry.id === 'u9',
    )
    if (asksHorizon && plan.um.a.u9 == null) plan.um.a.u9 = suggestedHorizonFor(plan)
    plan.um.done[section.step] = true
    plan.meEdit = {}
    if (MONEY_PROFILE.every(({ step }) => plan.um.done[step])) plan.um.rechecked = true
    plan.me = 'um'
  })
  const plan = useStore.getState().plan
  toast(
    profileAnswered(plan) === PROFILE_QUESTIONS
      ? `Saved. Your plan's risk profile is now ${confirmedRiskLabel(plan)}`
      : `${section.title} saved`,
  )
}
