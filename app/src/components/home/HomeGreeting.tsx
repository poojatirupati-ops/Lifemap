import { useStore } from '../../state/store.ts'
import { ageToday, dateLine, greeting } from './greeting.ts'

/** The plain greeting Home shows while a required choice is missing. */
export default function HomeGreeting({ stage }: { stage: string }) {
  const name = useStore((store) => store.plan.acct.name)
  const age = ageToday(useStore((store) => store.plan.about))

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
