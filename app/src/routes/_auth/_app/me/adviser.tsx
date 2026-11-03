import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '../../../../auth/client.ts'
import AdviserForm, { ADVISER_FORM_ID, isAdviser } from '../../../../components/me/AdviserForm.tsx'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import { backToMe } from '../../../../state/finances.ts'

// advisers only: anyone else goes back to Me
export const Route = createFileRoute('/_auth/_app/me/adviser')({
  beforeLoad: async () => {
    const { data } = await authClient.organization.getActiveMember().catch(() => ({ data: null }))
    if (!isAdviser(data?.role)) throw redirect({ to: '/me' })
  },
  component: MeAdviser,
})

function MeAdviser() {
  return (
    <AppScreen
      id="ME-ADV"
      note="Advisers only (tenant role adviser): their Cal.com link and the card customers see on the Experts tab (card C-CAL)."
      title="Your adviser profile"
      sub="How customers find and book you."
      back={backToMe}
      bell
      foot={
        <button className="btn" type="submit" form={ADVISER_FORM_ID}>
          Save
        </button>
      }
    >
      <AdviserForm />
    </AppScreen>
  )
}
