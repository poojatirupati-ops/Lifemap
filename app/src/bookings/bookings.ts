// Adviser bookings on the server: POST/GET /api/bookings and cancel. The adviserBooking flag is useFeature in shell/tenant.ts.
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient, send } from '../auth/planSync.ts'
import { adviserOf } from '../domain/identity/booking.ts'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

/** Bump when the share consent wording (SharePicks) changes: the server stores which version was agreed. */
export const SHARE_VERSION = '2026-11'

export interface Booking {
  id: string
  adviserId: string
  slot: string
  mode: string
  share: { report: boolean; finances: boolean; docs: boolean; moneyProfile: boolean }
  status: 'booked' | 'cancelled'
}

const BOOKINGS = ['bookings']

async function call<T>(method: string, url: string, body?: unknown): Promise<T> {
  const response = await send(method, url, body)
  if (!response.ok) throw new Error(`${url} ${response.status}`)
  return response.json()
}

/** The live (not cancelled) booking, or null. Keeps plan.booking.done in step, so Me sees it too. */
export function useActiveBooking() {
  const { data } = useQuery(
    {
      queryKey: BOOKINGS,
      queryFn: async () => {
        const { bookings } = await call<{ bookings: Booking[] }>('GET', '/api/bookings')
        const active = bookings.find((b) => b.status === 'booked') ?? null
        if (useStore.getState().plan.booking.done !== !!active)
          useStore.getState().update((plan) => void (plan.booking.done = !!active))
        return active
      },
    },
    queryClient,
  )
  return data ?? null
}

/** Books the picked adviser and slot, sharing exactly the ticked items. */
export const postBooking = ({ booking }: Pick<Plan, 'booking'>) =>
  call<{ booking: Booking }>('POST', '/api/bookings', {
    adviserId: adviserOf({ booking }).name,
    slot: booking.slot,
    mode: booking.mode,
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
      mutationFn: () => postBooking(useStore.getState().plan),
      onSuccess: ({ booking }) => {
        queryClient.setQueryData(BOOKINGS, booking)
        useStore.getState().bookingSaved()
      },
      onError: () => toast("We couldn't book that. Please try again."),
    },
    queryClient,
  )
}

export function useCancel() {
  return useMutation(
    {
      mutationFn: (id: string) => call('POST', `/api/bookings/${id}/cancel`),
      onSuccess: () => {
        queryClient.setQueryData(BOOKINGS, null)
        useStore.getState().bookingCancelled()
      },
      onError: () => toast("We couldn't cancel that. Please try again."),
    },
    queryClient,
  )
}
