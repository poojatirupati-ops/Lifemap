import { findings, type Protection } from '../../domain/planning/findings'
import type { ProjectionInputs } from '../../domain/planning/planSettings'
import type { project } from '../../domain/planning/project'
import { useStore } from '../../state/store'
import Emo from '../ui/Emo'

interface Props {
  plan: ProjectionInputs & { figures: Protection }
  /** the plan without any what-if */
  projection: ReturnType<typeof project>
}

// `css` is both the card's class and its explain sheet
const CARDS = [
  { key: 'strength', css: 'str', icon: '💪', label: 'Your main strength' },
  { key: 'gap', css: 'gap', icon: '🔎', label: 'Your main gap' },
  { key: 'decision', css: 'dec', icon: '🎯', label: 'Your biggest decision' },
] as const

/** What we found: three cards, each opening its explanation. */
export default function Findings({ plan, projection }: Props) {
  const openSheet = useStore((store) => store.openSheet)
  const found = findings(plan, projection.rows, projection.percent)
  return (
    <div className="found" style={{ marginTop: 8 }}>
      {CARDS.map(({ key, css, icon, label }) => (
        <button
          key={key}
          className={`fcard f2c ${css}`}
          onClick={() => openSheet(`explain|${css}`)}
        >
          <span className="f2c-i" aria-hidden="true">
            {icon}
          </span>
          <span className="f2c-m">
            <small>{label}</small>
            <b>
              <Emo>{found[key]}</Emo>
            </b>
          </span>
          <span className="f2c-go" aria-hidden="true">
            ›
          </span>
        </button>
      ))}
    </div>
  )
}
