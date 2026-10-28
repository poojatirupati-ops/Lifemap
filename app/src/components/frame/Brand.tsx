import { LOGO } from '../ui/icons.data.ts'
import Svg from '../ui/Svg.tsx'

/** The LifeMap logo and name. Hook-free, so heads may call it as a function. */
export default function Brand() {
  return (
    <div className="brand brand2">
      <span className="logo" aria-hidden="true">
        <Svg src={LOGO} />
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
