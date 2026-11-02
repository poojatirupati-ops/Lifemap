import { createFileRoute } from '@tanstack/react-router'
import FlowScreen from '../../../components/frame/FlowScreen.tsx'

function Body() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div className="spin" aria-hidden="true"></div>
      <p className="sub" style={{ marginTop: 18 }} role="status">
        Running your numbers…
      </p>
      <p className="small">If this takes a while, we'll email you when it's ready.</p>
    </div>
  )
}

export const Route = createFileRoute('/_auth/build/results')({ component: Building })

function Building() {
  return (
    <FlowScreen
      id="U1"
      note={'Loader. Never shows a made-up result.'}
      eye="Step 4 · Understand"
      title="Building your plan"
    >
      <Body />
    </FlowScreen>
  )
}
