const STEPS = [1, 2, 3, 4]

/** Four-step meter under a profile pill; the first `level` steps are lit. */
export default function Meter({ level }: { level: number }) {
  return (
    <i className="ec3-mt" aria-hidden="true">
      {STEPS.map((step) => (
        <em key={step} className={step <= level ? 'on' : undefined}></em>
      ))}
    </i>
  )
}
