import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../components/frame/AppScreen.tsx'
import SettingsBody from '../../../components/admin/SettingsBody.tsx'
import { goTo } from '../../../shell/router.ts'

export const Route = createFileRoute('/_auth/_app/admin')({ component: AdminSettings })

function AdminSettings() {
  return (
    <AppScreen
      id="ADMIN-SET"
      note="ADMIN VIEW (journey-spec §19.6, option C): the Settings block, controlled by LifeMap or a partner. Not shown to customers."
      title="Settings"
      sub="🔒 Admin view · not for customers"
      back={() => goTo('/plan')}
      bell
    >
      <SettingsBody />
    </AppScreen>
  )
}
