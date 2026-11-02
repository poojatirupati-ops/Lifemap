import { useFeature } from '../shell/tenant.ts'
import { talkToExpert } from '../state/explore.ts'
import { EXPERTS } from '../domain/identity/advisers.data.ts'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import SheetTitle from './SheetTitle.tsx'

export const key = 'xpert'

const WAYS = [
  {
    icon: '📞',
    title: 'Call me back',
    detail: 'Usually within 2 hours',
    way: 'call',
    note: "Pick an expert and a time and we'll call you back",
  },
  {
    icon: '📹',
    title: 'Book a video call',
    detail: 'Pick a time that suits you',
    way: 'video',
    note: 'Pick a time for your video call',
  },
  {
    icon: '✉️',
    title: 'Send a message',
    detail: 'Reply within one working day',
    way: 'msg',
    note: 'Pick an expert to send your message to',
  },
]

function contact(kind: string, way: string, note: string) {
  if (way === 'video') useStore.getState().setBooking({ mode: 'Video' })
  talkToExpert(kind)
  toast(note)
}

/** "Talk to an expert": three ways to get in touch. */
export function Body({ param: kind = 'planner' }: { param?: string }) {
  const title = EXPERTS[kind as keyof typeof EXPERTS]?.title ?? ''
  const mortgage = kind === 'mortgage'
  // calls and video calls are booked; a tenant without adviserBooking keeps only messages
  const ways = useFeature('adviserBooking') ? WAYS : WAYS.filter(({ way }) => way === 'msg')
  return (
    <div className="xsh">
      <div className="xwho">
        <span className="av" aria-hidden="true">
          {mortgage ? 'MS' : title[0]}
        </span>
        <div>
          <SheetTitle style={{ margin: 0, fontSize: 20 }}>
            {mortgage ? 'MortgageStop broker' : title}
          </SheetTitle>
          <div className="small">QFA · Regulated by the Central Bank</div>
        </div>
      </div>
      <span className="xtag">First call free</span>
      {ways.map(({ icon, title, detail, way, note }) => (
        <button className="xo" key={way} onClick={() => contact(kind, way, note)}>
          <span className="e" aria-hidden="true">
            {icon}
          </span>
          <span>
            <b>{title}</b>
            <small>{detail}</small>
          </span>
        </button>
      ))}
      <p className="small" style={{ margin: '12px 0 0' }}>
        🔒 You choose what to share before anyone sees your plan.
      </p>
    </div>
  )
}
