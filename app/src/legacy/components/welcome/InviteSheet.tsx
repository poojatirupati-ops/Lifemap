import { useState } from 'react'
import Button from '../ui/Button.tsx'
import Sheet from '../ui/Sheet.tsx'
import { setPlan } from '../../state/store.ts'
import { invite } from '../../content/welcome.data.ts'

/** The invite code is kept silently as the entry source (nothing is sent). */
export default function InviteSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [code, setCode] = useState('')
  const [linked, setLinked] = useState(false)
  const close = () => { setLinked(false); onClose() }
  return (
    <Sheet open={open} title={invite.title} onClose={close}>
      {linked ? <p role="status">{invite.linked}</p> : (
        <>
          <p>{invite.sub}</p>
          <label>{invite.label} <input value={code} maxLength={invite.max} onChange={e => setCode(e.target.value)} placeholder={invite.placeholder} /></label>
          <Button onClick={() => { setPlan({ entry: `adviser invite${code.trim() ? ` ${code.trim()}` : ''}` }); setLinked(true) }}>{invite.next}</Button>
        </>
      )}
    </Sheet>
  )
}
