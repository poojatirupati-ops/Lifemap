/** Q9 scenario: what you put in vs a month later. */
export default function DiscoverPanel({ panel: [from, to] }: { panel: [number, number] }) {
  const eur = (n: number) => `€${n.toLocaleString('en-IE')}`
  return (
    <div className="disc-panel">
      <p><span>You put in</span><strong>{eur(from)}</strong></p>
      <p><span>A month later</span><strong>{eur(to)}</strong></p>
      <i style={{ width: `${(to / from) * 100}%` }} />
    </div>
  )
}
