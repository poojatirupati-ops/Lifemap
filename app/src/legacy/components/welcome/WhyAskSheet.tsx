import Sheet from '../ui/Sheet.tsx'
import { links, whyAsk } from '../../content/welcome.data.ts'

export default function WhyAskSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <Sheet open={open} title={links.why} onClose={onClose}><p>{whyAsk}</p></Sheet>
}
