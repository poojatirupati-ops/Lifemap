// The Experts tab's booking journey: match (c1), share (c2), pick a time (c3), booked (c4).
import { ADVISERS, type ExpertKind } from '../domain/identity/advisers.data.ts'
import type { Share, Stage } from '../domain/identity/booking.ts'
import { isProfileComplete } from '../domain/discovery/profile.ts'
import { toast } from './shell.ts'
import type { Plan } from './types.ts'
import { addVersion } from './versions.ts'

type Book = Plan['booking']

interface StoreCore {
  update: (recipe: (plan: Plan) => void) => void
  closeSheet: () => void
}

export function createBookingSlice(get: () => StoreCore) {
  const update = (recipe: (plan: Plan) => void) => get().update(recipe)
  const updateBook = (recipe: (book: Book) => void) => update((plan) => recipe(plan.booking))

  return {
    showStage: (stage: Stage) =>
      update((plan) => {
        plan.tab = 'exp'
        plan.expertsPage = stage
      }),
    nextAdviser: () =>
      updateBook((book) => {
        book.adviser = (book.adviser + 1) % ADVISERS.length
      }),
    toggleSpecialist: (kind: ExpertKind) =>
      updateBook((book) => {
        book.spec = book.spec === kind ? null : kind
      }),
    setShare: (item: Share, on: boolean) =>
      updateBook((book) => {
        book.share[item] = on
      }),
    /** Agreement, meeting type, day or time. */
    setBooking: (patch: Partial<Pick<Book, 'agree' | 'mode' | 'day' | 'slot'>>) =>
      updateBook((book) => {
        Object.assign(book, patch)
      }),
    confirmBooking: () => {
      update((plan) => {
        plan.booking.done = true
        plan.expertsPage = 'c4'
        addVersion(plan, 'Adviser meeting booked')
      })
      toast('Booked. Confirmation sent by email and SMS')
    },
    /** C0's "Answer the questions": the profile, then back to the match. */
    answerProfileFirst: () =>
      update((plan) => {
        plan.moneyProfile.returnTo = 'c1'
        plan.tab = 'me'
        plan.mePage = 'um'
      }),
    /** "Check now": the profile, coming back to the match (or the Experts tab once booked). */
    checkProfile: () => {
      update((plan) => {
        plan.moneyProfile.returnTo = plan.booking.done ? 'exp' : 'c1'
        plan.tab = 'me'
        if (!isProfileComplete(plan)) plan.mePage = 'um'
        else plan.mePage = plan.moneyProfile.rechecked ? 'umr' : 'recheck'
      })
      get().closeSheet()
    },
  }
}

export type BookingActions = ReturnType<typeof createBookingSlice>
