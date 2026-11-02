// The Experts tab's booking journey: match (c1), share (c2), pick a time on Cal.com (c3), booked (c4).
import type { ExpertKind } from '../domain/identity/advisers.data.ts'
import type { Share, Stage } from '../domain/identity/booking.ts'
import { toast } from './shell.ts'
import type { Store } from './store.ts'
import type { Plan, Ui } from './types.ts'
import { addVersion } from './versions.ts'
import { goTo } from '../shell/router.ts'

type Book = Plan['booking']

export function createBookingSlice(get: () => Store) {
  const update = (recipe: (plan: Plan, ui: Ui) => void) => get().update(recipe)
  const updateBook = (recipe: (book: Book) => void) => update((plan) => recipe(plan.booking))

  return {
    /** A booking step, or the Experts tab's home ('home'). */
    showStage: (stage: Stage) => goTo(stage === 'home' ? '/experts' : `/experts/${stage}`),
    /** The next of the tenant's advisers (useAdviser wraps around). */
    nextAdviser: () => updateBook((book) => void (book.adviser += 1)),
    toggleSpecialist: (kind: ExpertKind) =>
      updateBook((book) => void (book.spec = book.spec === kind ? null : kind)),
    setShare: (item: Share, on: boolean) => updateBook((book) => void (book.share[item] = on)),
    /** Agreement or meeting type. */
    setBooking: (patch: Partial<Pick<Book, 'agree' | 'mode'>>) =>
      updateBook((book) => {
        Object.assign(book, patch)
      }),
    /** After Cal.com confirmed it (its webhook reached the server). */
    bookingSaved: () => {
      update((plan) => {
        plan.booking.done = true
        addVersion(plan, 'Adviser meeting booked')
      })
      goTo('/experts/c4')
      toast('Booked. Confirmation sent by email')
    },
    /** After a cancel on Cal.com reached the server: the share is withdrawn, so nothing stays ticked. */
    bookingCancelled: () => {
      update((plan) => {
        Object.assign(plan.booking, { done: false, agree: false, slot: null, day: undefined })
        plan.booking.share = { report: false, fin: false, docs: false, um: false }
        addVersion(plan, 'Adviser meeting cancelled')
      })
      toast('Meeting cancelled. Your adviser no longer sees what you shared.')
    },
    /** C0's "Answer the questions": the profile, then back to the match. */
    answerProfileFirst: () => {
      update((plan) => void (plan.moneyProfile.returnTo = 'c1'))
      goTo('/me/profile')
    },
    /** "Check now": the profile, coming back to the match (or the Experts tab once booked). */
    checkProfile: () => {
      update((plan) => void (plan.moneyProfile.returnTo = plan.booking.done ? 'exp' : 'c1'))
      get().closeSheet()
      goTo(get().profilePage(get().plan))
    },
  }
}

export type BookingActions = ReturnType<typeof createBookingSlice>
