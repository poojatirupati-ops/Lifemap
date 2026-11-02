import { useGreeting } from '../../hooks/useGreeting.ts'
import { dateLine, greeting } from '../../lib/greeting.ts'

/** The plain greeting Home shows while a required choice is missing. */
export default function HomeGreeting({ stage }: { stage: string }) {
  const { name, age } = useGreeting()

  return (
    <div className="hgreet">
      <div className="eyebrow hdate">
        <i aria-hidden="true"></i>
        {dateLine()}
      </div>
      <h2 className="t" tabIndex={-1}>
        {greeting() + (name ? `, ${name}` : '')}
      </h2>
      <p className="sub" style={{ margin: 0 }}>
        {stage + (age ? ` · ${age} years old` : '')}
      </p>
    </div>
  )
}
