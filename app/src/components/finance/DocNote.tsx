/** "You typed €3,000. Your statement says €3,100; we're using that." Empty when it does not apply. */
export default function DocNote({ id, note }: { id: string; note: string }) {
  return (
    <span
      className="small dnote"
      id={id}
      role="status"
      style={{ display: 'block', color: 'var(--acc-d)' }}
    >
      {note}
    </span>
  )
}
