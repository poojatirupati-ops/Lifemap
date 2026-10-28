import { useState } from 'react'
import AskSheet from '../components/ask/AskSheet.tsx'

export default function AskButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="ask-fab" onClick={() => setOpen(true)}>Ask</button>
      <AskSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
