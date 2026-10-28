import InstallHint from './pwa/InstallHint.tsx'
import { useSession } from './identity/useSession.ts'
import AppFrame from './components/layout/AppFrame.tsx'
import Shell from './shell/Shell.tsx'
import { screens } from './shell/routes.ts'

export default function App() {
  const { status } = useSession()
  return (
    <AppFrame>
      <Shell screens={screens} status={status} />
      <InstallHint />
    </AppFrame>
  )
}
