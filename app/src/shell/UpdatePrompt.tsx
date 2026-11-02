/// <reference types="vite-plugin-pwa/react" />
import { useRegisterSW } from 'virtual:pwa-register/react'

/** vite-plugin-pwa prompt mode: a new build waits until the user chooses to reload. */
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <div
      className="note"
      role="status"
      style={{ position: 'absolute', left: 16, right: 16, bottom: 96, zIndex: 31 }}
    >
      <p>A new version of LifeMap is ready.</p>
      <button className="btn sm" onClick={() => void updateServiceWorker()}>
        Update
      </button>
    </div>
  )
}
