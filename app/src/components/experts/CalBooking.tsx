import Cal, { getCalApi } from '@calcom/embed-react'
import { useEffect, useState } from 'react'
import { authClient } from '../../auth/client.ts'
import { queryClient } from '../../auth/planSync.ts'
import { BOOKINGS, CAL_ORIGIN, useAdviser, useBookings } from '../../bookings/bookings.ts'
import { useStore } from '../../state/store.ts'

const NAMESPACE = 'lifemap'
const EMBED_JS = `${CAL_ORIGIN}/embed/embed.js`

/**
 * Step c3: the adviser's Cal.com calendar, inline, in the app's colours and prefilled with the user's name and email. It carries our pending
 * booking's id (metadata[bookingId]) so Cal.com's webhook can confirm it. Cal.com's success message is only a cue to refetch: the booking
 * counts once the webhook has confirmed it on the server.
 */
export default function CalBooking() {
  const adviser = useAdviser()
  const user = authClient.useSession().data?.user
  const [calUid, setCalUid] = useState<string>()
  const bookings = useBookings(calUid ? 2000 : false)
  const pending = bookings.find((b) => b.status === 'pending' && b.adviserId === adviser?.id)
  const confirmed = !!calUid && bookings.some((b) => b.calUid === calUid && b.status === 'booked')

  useEffect(() => {
    if (confirmed) useStore.getState().bookingSaved()
  }, [confirmed])

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

  if (!adviser || !pending || !user) return null
  return (
    <Cal
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
