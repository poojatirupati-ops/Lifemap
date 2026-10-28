import { useState } from 'react'
import Button from '../ui/Button.tsx'
import InviteSheet from './InviteSheet.tsx'
import WhyAskSheet from './WhyAskSheet.tsx'
import { links } from '../../content/welcome.data.ts'

/** The only two links on the cover. */
export default function CoverLinks() {
  const [open, setOpen] = useState<'invite' | 'why' | null>(null)
  const close = () => setOpen(null)
  return (
    <>
      <p className="cover-links">
        <Button variant="link" onClick={() => setOpen('invite')}>{links.invite}</Button>
        <span aria-hidden="true">·</span>
        <Button variant="link" onClick={() => setOpen('why')}>{links.why}</Button>
      </p>
      <WhyAskSheet open={open === 'why'} onClose={close} />
      <InviteSheet open={open === 'invite'} onClose={close} />
    </>
  )
}
