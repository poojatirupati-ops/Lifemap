/** A one-line prompt with an optional link, e.g. "Check your profile before your adviser meeting". */
export default function Nudge({
  icon,
  text,
  action,
  onAction,
}: {
  icon: string
  text: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="nudge">
      <span aria-hidden="true">{icon}</span>
      <span>{text}</span>
      {action ? (
        <button className="link" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  )
}
