import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'

/** A partner who was invited adds their own income; until then it counts as €0. */
export default function PartnerIncomeNote() {
  const { waiting, sent, email } = useStore(
    useShallow(({ plan }) => ({
      waiting: !!plan.about.partner && plan.partner.mode === 'invite',
      sent: plan.partner.sent,
      email: plan.partner.email,
    })),
  )
  if (!waiting) return null
  return (
    <p className="note">
      <Emo>💌 Your partner adds their own income</Emo>
      {sent ? ` (invite saved for ${email})` : null}. Until then it counts as €0 in your plan.
    </p>
  )
}
