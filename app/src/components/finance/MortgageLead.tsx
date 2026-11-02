import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'

/** Liabilities opens with the mortgage on the home they live in. */
export default function MortgageLead() {
  const home: string | undefined = useStore(({ plan }) => plan.figures.home)
  const answer = useStore(({ plan }) => plan.figures.mortYN)
  const onOtherProperty = !!home && !/^Own/.test(home) && answer === 'Yes'
  return (
    <>
      <b style={{ fontSize: 16 }}>
        <Emo>🏠 Mortgage</Emo>
      </b>
      <p className="small" style={{ margin: '2px 0 10px' }}>
        The mortgage on the home you live in comes first.
        {onOtherProperty
          ? ` You said "${home}", so this one is on another property. Add its details below.`
          : null}
      </p>
    </>
  )
}
