import { useInstall } from './useInstall.ts'

export default function InstallHint() {
  const { install, iosHint } = useInstall()
  if (install) return <button onClick={install}>Install LifeMap</button>
  if (iosHint) return <p>To install: tap Share, then Add to Home Screen.</p>
  return null
}
