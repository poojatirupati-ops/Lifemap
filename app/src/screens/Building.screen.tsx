import FlowHead from '../components/frame/FlowHead.tsx'

export const key = 'U1'
export const id = 'U1'
export const note = 'Loader. Never shows a made-up result.'

export const Head = () => FlowHead({ eye: 'Step 4 · Understand', title: 'Building your plan' })

export function Body() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div className="spin" aria-hidden="true"></div>
      <p className="sub" style={{ marginTop: 18 }} role="status">
        Running your numbers…
      </p>
      <p className="small">If this takes a while, we'll email and text you when it's ready.</p>
    </div>
  )
}
