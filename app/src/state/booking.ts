// The Experts tab's booking journey: match (c1), share (c2), pick a time (c3), booked (c4).
import { ADVISERS, type ExpertKind } from '../domain/identity/advisers.data.ts'
import type { Share, Stage } from '../domain/identity/booking.ts'
import { isProfileComplete } from '../domain/discovery/profile.ts'
import { toast } from './shell.ts'
import type { SetStore, Store } from './store.ts'
import type { Plan, Ui } from './types.ts'
import { addVersion } from './versions.ts'

type Book = Plan['booking']

export function createBookingSlice(set: SetStore, get: () => Store) {
  const update = (recipe: (plan: Plan, ui: Ui) => void) => get().update(recipe)
  const updateBook = (recipe: (book: Book) => void) => update((plan) => recipe(plan.booking))

  return {
    showStage: (stage: Stage) => set({ tab: 'exp', expertsPage: stage }),
    nextAdviser: () =>
      updateBook((book) => void (book.adviser = (book.adviser + 1) % ADVISERS.length)),
    toggleSpecialist: (kind: ExpertKind) =>
      updateBook((book) => void (book.spec = book.spec === kind ? null : kind)),
    setShare: (item: Share, on: boolean) => updateBook((book) => void (book.share[item] = on)),
    /** Agreement, meeting type, day or time. */
    setBooking: (patch: Partial<Pick<Book, 'agree' | 'mode' | 'day' | 'slot'>>) =>
      updateBook((book) => {
        Object.assign(book, patch)
      }),
    /** After POST /api/bookings saved it. */
    bookingSaved: () => {
      update((plan, ui) => {
        plan.booking.done = true
        ui.expertsPage = 'c4'
        addVersion(plan, 'Adviser meeting booked')
      })
      toast('Booked. Confirmation sent by email')
    },
    /** After the cancel was saved: the share is withdrawn, so nothing stays ticked. */
    bookingCancelled: () => {
      update((plan, ui) => {
        Object.assign(plan.booking, { done: false, agree: false, slot: null, day: undefined })
        plan.booking.share = { report: false, fin: false, docs: false, um: false }
        ui.expertsPage = 'home'
        addVersion(plan, 'Adviser meeting cancelled')
      })
      toast('Meeting cancelled. Your adviser no longer sees what you shared.')
    },
    /** C0's "Answer the questions": the profile, then back to the match. */
    answerProfileFirst: () =>
      update((plan, ui) => {
        plan.moneyProfile.returnTo = 'c1'
        ui.tab = 'me'
        ui.mePage = 'um'
      }),
    /** "Check now": the profile, coming back to the match (or the Experts tab once booked). */
    checkProfile: () => {
      update((plan, ui) => {
        plan.moneyProfile.returnTo = plan.booking.done ? 'exp' : 'c1'
        ui.tab = 'me'
        if (!isProfileComplete(plan)) ui.mePage = 'um'
        else ui.mePage = plan.moneyProfile.rechecked ? 'umr' : 'recheck'
      })
      get().closeSheet()
    },
  }
}

export type BookingActions = ReturnType<typeof createBookingSlice>
