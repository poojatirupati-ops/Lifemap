// Adviser bookings on the server: GET /api/advisers, POST/GET /api/bookings. Cal.com books, moves and cancels the meeting; its webhook
// updates the server, and the app refetches. The adviserBooking flag is useFeature in shell/tenant.ts.
import { useMutation, useQuery } from '@tanstack/react-query'
import { authClient } from '../auth/client.ts'
import { queryClient, send } from '../auth/planSync.ts'
import { slotLabel } from '../domain/identity/booking.ts'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

/** Bump when the share consent wording (SharePicks) changes: the server stores which version was agreed. */
export const SHARE_VERSION = '2026-11'

/** Cal.com (EU by default): the embed, its script and the cancel page. */
export const CAL_ORIGIN = import.meta.env.VITE_CAL_ORIGIN ?? 'https://app.cal.eu'
export const EMBED_JS = `${CAL_ORIGIN}/embed/embed.js`

export interface Adviser {
  id: string
  name: string
  calLink: string
  profile: {
    qualifications: string
    languages: string
    location: string
    meetingMode: string
  } | null
}

export interface Booking {
  id: string
  adviserId: string
  share: { report: boolean; finances: boolean; docs: boolean; moneyProfile: boolean }
  /** Only booked is a live meeting: ended and no_show are over. */
  status: 'pending' | 'booked' | 'cancelled' | 'ended' | 'no_show'
  calUid: string | null
  startsAt: string | null
}

/** A member role is the tenant role adviser (Better Auth keeps several roles comma-separated). */
export const isAdviser = (role = '') => role.split(',').includes('adviser')

/** The session's member has the tenant role adviser. */
export const useIsAdviser = () => isAdviser(authClient.useActiveMember().data?.role)

export const BOOKINGS = ['bookings']
export const ADVISERS = ['advisers']

/** A JSON request to the API; throws on an error status. */
export async function call<T>(method: string, url: string, body?: unknown): Promise<T> {
  const response = await send(method, url, body)
  if (!response.ok) throw new Error(`${url} ${response.status}`)
  return response.json()
}

/** The tenant's advisers (members with role adviser and a Cal.com link). */
export const useAdvisers = () =>
  useQuery(
    {
      queryKey: ADVISERS,
      queryFn: async () => (await call<{ advisers: Adviser[] }>('GET', '/api/advisers')).advisers,
      staleTime: 5 * 60_000,
    },
    queryClient,
  ).data ?? []

/** The adviser the match shows ("See another match" steps through them); undefined while loading or when the tenant has none. */
export function useAdviser(): Adviser | undefined {
  const advisers = useAdvisers()
  const index = useStore((store) => store.plan.booking.adviser)
  return advisers[index % advisers.length]
}

/**
 * The caller's bookings, newest first. Keeps plan.booking in step with the server (so Me sees it too): done and the time of the confirmed
 * booking; once it is over (cancelled on Cal.com, ended or a no-show) the share picks and agreement clear too.
 */
export function useBookings(refetchInterval: number | false = false) {
  return (
    useQuery(
      {
        queryKey: BOOKINGS,
        queryFn: async () => {
          const { bookings } = await call<{ bookings: Booking[] }>('GET', '/api/bookings')
          const active = bookings.find((b) => b.status === 'booked')
          const { plan, update, bookingOver } = useStore.getState()
          const slot = active?.startsAt ? slotLabel(new Date(active.startsAt)) : plan.booking.slot
          // with no booked one, the newest that is not pending was cancelled, ended or a no-show
          const over = bookings.find((b) => b.status !== 'pending')
          if (!active && plan.booking.done && over) bookingOver(over.status === 'cancelled')
          else if (plan.booking.done !== !!active || plan.booking.slot !== slot)
            update((p) => void Object.assign(p.booking, { done: !!active, slot }))
          return bookings
        },
        refetchInterval,
      },
      queryClient,
    ).data ?? []
  )
}

/** The newest pending booking, if any. */
export const newestPending = (bookings: Booking[]) => bookings.find((b) => b.status === 'pending')

/** Booked on Cal.com (it has a calUid) but its webhook has not confirmed it here yet. */
export const useConfirming = () => !!newestPending(useBookings())?.calUid

/** The live (confirmed, not cancelled) booking, or null. */
export const useActiveBooking = () => useBookings().find((b) => b.status === 'booked') ?? null

/** Records the share picks as the pending booking (the open one, if any), then opens the adviser's Cal.com calendar (c3) for it. */
export const postBooking = ({ booking }: Pick<Plan, 'booking'>, adviserId: string) =>
  call<{ booking: Booking }>('POST', '/api/bookings', {
    adviserId,
    share: {
      report: booking.share.report,
      finances: booking.share.fin,
      docs: booking.share.docs,
      moneyProfile: booking.share.um,
    },
    shareVersion: SHARE_VERSION,
  })

export function useBook() {
  return useMutation(
    {
      mutationFn: (adviserId: string) => postBooking(useStore.getState().plan, adviserId),
      // the server hands back the caller's open pending booking rather than a new one
      onSuccess: ({ booking }) => {
        queryClient.setQueryData<Booking[]>(BOOKINGS, (bookings = []) => [
          booking,
          ...bookings.filter((b) => b.id !== booking.id),
        ])
        useStore.getState().showStage('c3')
      },
      onError: () => toast("We couldn't start the booking. Please try again."),
    },
    queryClient,
  )
}

/** Cal.com's own page to cancel the meeting (its webhook then cancels it here and withdraws the share). */
export const cancelUrl = (calUid: string) => `${CAL_ORIGIN}/booking/${calUid}?cancel=true`
