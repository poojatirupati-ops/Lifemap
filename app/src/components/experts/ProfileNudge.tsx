import { needsProfile } from '../../domain/identity/booking.ts'
import { useStore } from '../../state/store.ts'
import Nudge from './Nudge.tsx'

/** Until the full profile is done and confirmed: check it before the meeting. */
export default function ProfileNudge() {
  const needed = useStore(({ plan }) => needsProfile(plan))
  const checkProfile = useStore((store) => store.checkProfile)
  if (!needed) return null
  return (
    <Nudge
      icon="🧭"
      text="Check your profile before your adviser meeting"
      action="Check now"
      onAction={checkProfile}
    />
  )
}
