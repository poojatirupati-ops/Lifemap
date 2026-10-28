import { useEffect, useState } from 'react'
import Sheet from '../ui/Sheet.tsx'
import { answers, glossary } from './ask.data.ts'

type Props = { open: boolean; onClose: () => void }

// Help sheet: plain answers and a glossary. Returns focus to the opener on close.
export default function AskSheet({ open, onClose }: Props) {
  const [opener, setOpener] = useState<HTMLElement | null>(null)
  // Capture during render: Sheet's showModal() moves focus into the dialog at commit, too late to read it then.
  if (open && !opener) setOpener(document.activeElement as HTMLElement | null)
  if (!open && opener) setOpener(null)
  useEffect(() => () => opener?.focus(), [opener]) // runs after the dialog is gone
  return (
    <Sheet open={open} title="Ask" onClose={onClose}>
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <h3>Quick answers</h3>
        {answers.map(({ q, a }) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
        <h3>Money words</h3>
        <dl>
          {glossary.map(({ term, def }) => (
            <div key={term}>
              <dt><strong>{term}</strong></dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p><small>Guidance, not advice.</small></p>
    </Sheet>
  )
}
