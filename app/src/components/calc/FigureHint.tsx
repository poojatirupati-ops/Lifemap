/** Why a typed figure was changed (Max €2,500,000), read out politely. */
export default function FigureHint({ inputKey, hint }: { inputKey: string; hint: string }) {
  return (
    <span className="nbhint" id={`nh-ck-${inputKey}`} role="status" aria-live="polite">
      {hint}
    </span>
  )
}
