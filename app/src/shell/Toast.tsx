import { useShell } from '../state/shell.ts'

export default function Toast() {
  const message = useShell((shell) => shell.toastMessage)
  return (
    <div id="toast" role="status" aria-live="polite">
      {message != null && (
        <div className="t">
          <span aria-hidden="true">✨</span>
          {message}
        </div>
      )}
    </div>
  )
}
