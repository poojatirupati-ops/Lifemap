import { useState } from 'react'
import { deleteAccount } from '../auth/session.ts'
import CloseButton from './CloseButton.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'delete'

export function Body() {
  const [deleting, setDeleting] = useState(false)
  const deleteEverything = async () => {
    setDeleting(true)
    await deleteAccount() // says "deleted" only once the server confirms
    setDeleting(false)
  }
  return (
    <>
      <SheetTitle>Delete my data?</SheetTitle>
      <p className="sub">
        Your plan, answers, figures and documents will be deleted. This can't be undone.
      </p>
      <button
        className="btn"
        style={{ background: 'var(--gap-t)' }}
        onClick={deleteEverything}
        disabled={deleting}
      >
        {deleting ? 'Deleting…' : 'Delete everything'}
      </button>
      <CloseButton ghost style={{ marginTop: 10 }}>
        Keep my data
      </CloseButton>
    </>
  )
}
