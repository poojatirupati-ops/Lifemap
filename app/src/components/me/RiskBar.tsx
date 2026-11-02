import { PROFILE_SECTIONS, type ProfileSection } from '../../domain/discovery/terms.data.ts'

/** One factor of the risk profile, out of 5. */
export default function RiskBar({
  section,
  level,
}: {
  section: ProfileSection
  level: number | null
}) {
  const { title, plain } = PROFILE_SECTIONS[section]
  return (
    <div style={{ marginTop: 10, fontSize: 13 }}>
      <div>
        <b>{title}:</b> {plain}
      </div>
      <span className="pbar" style={{ display: 'block', marginTop: 4 }}>
        <i style={{ width: `${Math.round(((level ?? 0) / 5) * 100)}%` }}></i>
      </span>
    </div>
  )
}
