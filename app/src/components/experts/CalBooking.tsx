import Cal, { getCalApi } from '@calcom/embed-react'
import { useEffect, useState } from 'react'
import { authClient } from '../../auth/client.ts'
import { queryClient } from '../../auth/planSync.ts'
import {
  BOOKINGS,
  CAL_ORIGIN,
  EMBED_JS,
  useAdvisers,
  useBookings,
} from '../../bookings/bookings.ts'
import { useStore } from '../../state/store.ts'

const NAMESPACE = 'lifemap'
const POLL_MS = 2000
/** How long to wait for Cal.com's webhook before leaving it to the confirmation email. */
const WAIT_MS = 2 * 60_000

/**
 * Step c3: the adviser's Cal.com calendar, inline, in the app's colours and prefilled with the user's name and email. It is for the newest
 * pending booking (with its adviser) and carries its id (metadata[bookingId]) so Cal.com's webhook can confirm it. Cal.com's success
 * message is only a cue to refetch: the booking counts once the webhook has confirmed it on the server.
 */
export default function CalBooking() {
  const advisers = useAdvisers()
  const user = authClient.useSession().data?.user
  const [calUid, setCalUid] = useState<string>()
  const [waitedOut, setWaitedOut] = useState(false)
  const bookings = useBookings(calUid && !waitedOut ? POLL_MS : false)
  const pending = bookings.find((b) => b.status === 'pending')
  const adviser = advisers.find((a) => a.id === pending?.adviserId)
  const confirmed = !!calUid && bookings.some((b) => b.calUid === calUid && b.status === 'booked')

  useEffect(() => {
    if (confirmed) useStore.getState().bookingSaved()
  }, [confirmed])

  useEffect(() => {
    if (!calUid) return
    const timer = setTimeout(() => setWaitedOut(true), WAIT_MS)
    return () => clearTimeout(timer)
  }, [calUid])

  useEffect(() => {
    const api = getCalApi({ namespace: NAMESPACE, embedJsUrl: EMBED_JS })
    const callback = (event: { detail: { data: { uid?: string } } }) => {
      setCalUid(event.detail.data.uid)
      void queryClient.invalidateQueries({ queryKey: BOOKINGS })
    }
    void api.then((cal) => {
      // the tenant's colours are already on the CSS tokens (useBranding)
      const brand = getComputedStyle(document.documentElement).getPropertyValue('--sea').trim()
      cal('ui', {
        cssVarsPerTheme: { light: { 'cal-brand': brand }, dark: { 'cal-brand': brand } },
      })
      cal('on', { action: 'bookingSuccessfulV2', callback })
    })
    return () => void api.then((cal) => cal('off', { action: 'bookingSuccessfulV2', callback }))
  }, [])

  if (waitedOut && !confirmed)
    return (
      <div className="card" role="status">
        <p className="small">We're confirming your booking, we'll email you.</p>
      </div>
    )
  if (!adviser || !pending || !user) return null
  return (
    <Cal
      // a new adviser or booking is a new calendar
      key={`${adviser.calLink}:${pending.id}`}
      namespace={NAMESPACE}
      calLink={adviser.calLink}
      calOrigin={CAL_ORIGIN}
      embedJsUrl={EMBED_JS}
      style={{ width: '100%', overflow: 'auto' }}
      config={{
        name: user.name,
        email: user.email,
        'metadata[bookingId]': pending.id,
        theme: 'light',
      }}
    />
  )
}
