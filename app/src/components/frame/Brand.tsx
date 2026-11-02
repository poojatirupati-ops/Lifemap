import { Logo } from '../ui/icons.tsx'

/** The LifeMap logo and name. Hook-free, so heads may call it as a function. */
export default function Brand() {
  return (
    <div className="brand brand2">
      <span className="logo" aria-hidden="true">
        <Logo />
      </span>
      <span className="bt">
        <b>
          Life<em>Map</em>
        </b>
        <small>by DigiPro.AI</small>
      </span>
    </div>
  )
}
