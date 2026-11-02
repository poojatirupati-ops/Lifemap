import { createFileRoute } from '@tanstack/react-router'
import AdviserForm, { ADVISER_FORM_ID } from '../../../../components/me/AdviserForm.tsx'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import { backToMe } from '../../../../state/finances.ts'

export const Route = createFileRoute('/_auth/_app/me/adviser')({ component: MeAdviser })

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
