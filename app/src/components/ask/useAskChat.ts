import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface Message {
  from: 'me' | 'bot'
  text?: ReactNode
  /** the suggested question this asked, so it is not offered again */
  topic?: string | null
  typing?: boolean
}

const TYPING_MS = 650
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** The chat while Ask is open: what was said, and a short typing pause before each answer. */
export function useAskChat() {
  const [log, setLog] = useState<Message[]>([])
  const [showAll, setShowAll] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const ask = (question: string, topic: string | null, answer: ReactNode) => {
    setShowAll(false)
    setLog((previous) => [
      ...previous,
      { from: 'me', text: question, topic },
      { from: 'bot', typing: true },
    ])
    timer.current = setTimeout(
      () => setLog((previous) => previous.with(-1, { from: 'bot', text: answer })),
      reducedMotion() ? 0 : TYPING_MS,
    )
  }

  return { log, showAll, ask, showMore: () => setShowAll(true) }
}
