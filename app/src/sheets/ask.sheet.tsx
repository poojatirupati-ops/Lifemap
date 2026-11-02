import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { contextTopic } from '../components/ask/contextTopic.ts'
import { matchQuestion } from '../components/ask/matchQuestion.ts'
import { planTopics } from '../components/ask/planTopics.tsx'
import { useAskAnswers, type AskAnswer as Topic } from '../content/cms.tsx'
import SheetTitle from './SheetTitle.tsx'
import { prefersReducedMotion } from '../hooks/reducedMotion.ts'
import { useProjection } from '../hooks/useProjection.ts'
import { toast, useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'

export const key = 'ask'
export const chat = true

const MAX_QUESTION = 140
const TYPING_MS = 650
const FIRST_SUGGESTIONS = 4

interface Message {
  from: 'me' | 'bot'
  text?: ReactNode
  /** the suggested question this asked, so it is not offered again */
  topic?: string | null
  typing?: boolean
}

/** One message: the customer's on the right, LifeMap's (or its typing dots) on the left. */
function ChatBubble({ message }: { message: Message }) {
  if (message.from === 'me')
    return (
      <div className="cb me">
        <p>{message.text}</p>
      </div>
    )
  return (
    <div className="cb bot">
      <span className="cb-av" aria-hidden="true">
        ✦
      </span>
      <p>
        {message.typing ? (
          <span className="cb-typing" aria-label="LifeMap is typing">
            <i></i>
            <i></i>
            <i></i>
          </span>
        ) : (
          message.text
        )}
      </p>
    </div>
  )
}

/** Ask LifeMap: a chat that explains how LifeMap works and what the results mean, never advice. */
/** `param` is a plan topic to show as already asked (the ASK jump: 'pgap'). */
export function Body({ param }: { param?: string }) {
  const { inputs, base, whatIf } = useProjection()
  const { hasResults, moneyProfile, name } = useStore(
    useShallow(({ plan }) => ({
      hasResults: plan.hasResults,
      moneyProfile: plan.moneyProfile,
      name: plan.account.name,
    })),
  )
  const { general, guard } = useAskAnswers()
  const screenId = useShell((shell) => shell.screenId)
  const input = useRef<HTMLInputElement>(null)
  const chatLog = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const ownTopics = useMemo(
    () => planTopics({ ...inputs, hasResults, moneyProfile }, base, whatIf),
    [inputs, hasResults, moneyProfile, base, whatIf],
  )
  const [log, setLog] = useState<Message[]>(() => {
    const seed = param && (ownTopics.find((topic) => topic.key === param) ?? ownTopics[0])
    return seed
      ? [
          { from: 'me', text: seed.question, topic: seed.key },
          { from: 'bot', text: seed.answer },
        ]
      : []
  })
  const [showAll, setShowAll] = useState(false)
  const topics = useMemo(() => {
    const context = contextTopic(screenId)
    return [...(context ? [context] : []), ...ownTopics, ...general]
  }, [screenId, ownTopics, general])
  const asked = new Set(log.map((message) => message.topic).filter(Boolean))
  const left = topics.filter((topic) => !asked.has(topic.key))
  const waiting = log.at(-1)?.typing

  useLayoutEffect(() => {
    if (chatLog.current) chatLog.current.scrollTop = chatLog.current.scrollHeight
  }, [log, showAll])

  /** Shows the question, then the answer after a short typing pause. */
  const ask = (question: string, topic: string | null, answer: ReactNode) => {
    setShowAll(false)
    setLog((previous) => [
      ...previous,
      { from: 'me', text: question, topic },
      { from: 'bot', typing: true },
    ])
    timer.current = setTimeout(
      () => setLog((previous) => previous.with(-1, { from: 'bot', text: answer })),
      prefersReducedMotion() ? 0 : TYPING_MS,
    )
  }
  const askTopic = (topic: Topic) => {
    ask(topic.question, topic.key, topic.answer)
    input.current?.focus()
  }
  const askTyped = () => {
    const field = input.current
    if (!field) return
    const typed = field.value.trim()
    if (!typed) return toast('Type a question first')
    const question = typed.slice(0, MAX_QUESTION)
    field.value = ''
    ask(question, null, matchQuestion(question, [...ownTopics, ...general], hasResults, guard))
    field.focus()
  }

  return (
    <div className="chat">
      <div className="chat-h">
        <span className="chat-av" aria-hidden="true">
          ✦
        </span>
        <span className="chat-ht">
          <SheetTitle>Ask LifeMap</SheetTitle>
          <small>
            <i aria-hidden="true"></i>Explanations only · never advice
          </small>
        </span>
      </div>
      <div className="chat-log" id="chat-log" aria-live="polite" ref={chatLog}>
        <ChatBubble
          message={{
            from: 'bot',
            text: `Hi${name ? ` ${name}` : ''}! 👋 I can explain how LifeMap works and what your results mean. Pick a question or type your own.`,
          }}
        />
        {log.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}
        {left.length > 0 && !waiting ? (
          // suggested questions not asked yet: four, then all of them on "More questions"
          <div className="chat-sug">
            {log.length > 0 ? <small>You could also ask</small> : null}
            {(showAll ? left : left.slice(0, FIRST_SUGGESTIONS)).map((topic) => (
              <button className="cs" key={topic.key} onClick={() => askTopic(topic)}>
                {topic.question}
              </button>
            ))}
            {!showAll && left.length > FIRST_SUGGESTIONS ? (
              <button className="cs more" onClick={() => setShowAll(true)}>
                More questions
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="chat-in">
        <input
          className="in"
          id="ask-in"
          autoComplete="off"
          placeholder="Ask about your plan…"
          aria-label="Type your question"
          defaultValue=""
          ref={input}
          onKeyDown={(event) => {
            if (event.key === 'Enter') askTyped()
          }}
        />
        <button className="chat-send" aria-label="Send" onClick={askTyped}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <p className="chat-disc">
        Answers explain your figures and our assumptions. Not financial advice.
      </p>
    </div>
  )
}
