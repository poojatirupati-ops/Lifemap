import { useLayoutEffect, useMemo, useRef } from 'react'
import ChatBubble from '../components/ask/ChatBubble.tsx'
import { contextTopic } from '../components/ask/contextTopic.ts'
import { matchQuestion } from '../components/ask/matchQuestion.ts'
import { planTopics } from '../components/ask/planTopics.tsx'
import Suggestions from '../components/ask/Suggestions.tsx'
import { GENERAL_TOPICS, type Topic } from '../components/ask/topics.tsx'
import { useAskChat } from '../components/ask/useAskChat.ts'
import { toast, useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'

export const key = 'ask'
export const chat = true

const MAX_QUESTION = 140

/** Ask LifeMap: a chat that explains how LifeMap works and what the results mean, never advice. */
export function Body() {
  const plan = useStore((store) => store.plan)
  const screenId = useShell((shell) => shell.screenId)
  const { log, showAll, ask, showMore } = useAskChat()
  const input = useRef<HTMLInputElement>(null)
  const chatLog = useRef<HTMLDivElement>(null)

  const ownTopics = useMemo(() => planTopics(plan), [plan])
  const topics = useMemo(() => {
    const context = contextTopic(screenId)
    return [...(context ? [context] : []), ...ownTopics, ...GENERAL_TOPICS]
  }, [screenId, ownTopics])
  const asked = new Set(log.map((message) => message.topic).filter(Boolean))
  const left = topics.filter((topic) => !asked.has(topic.key))
  const waiting = log.at(-1)?.typing

  useLayoutEffect(() => {
    if (chatLog.current) chatLog.current.scrollTop = chatLog.current.scrollHeight
  }, [log, showAll])

  const askTopic = (topic: Topic) => {
    ask(topic.question, topic.key, topic.answer)
    input.current?.focus()
  }
  const askTyped = () => {
    const typed = input.current?.value.trim() ?? ''
    if (!typed) return toast('Type a question first')
    const question = typed.slice(0, MAX_QUESTION)
    input.current!.value = ''
    ask(
      question,
      null,
      matchQuestion(question, [...ownTopics, ...GENERAL_TOPICS], ownTopics.length > 0, plan.app),
    )
    input.current?.focus()
  }

  return (
    <div className="chat">
      <div className="chat-h">
        <span className="chat-av" aria-hidden="true">
          ✦
        </span>
        <span className="chat-ht">
          <h2 className="t" id="sheet-t" tabIndex={-1}>
            Ask LifeMap
          </h2>
          <small>
            <i aria-hidden="true"></i>Explanations only · never advice
          </small>
        </span>
      </div>
      <div className="chat-log" id="chat-log" aria-live="polite" ref={chatLog}>
        <ChatBubble
          message={{
            from: 'bot',
            text: `Hi${plan.acct.name ? ` ${plan.acct.name}` : ''}! 👋 I can explain how LifeMap works and what your results mean. Pick a question or type your own.`,
          }}
        />
        {log.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}
        {left.length && !waiting ? (
          <Suggestions
            topics={left}
            asked={log.length > 0}
            showAll={showAll}
            onAsk={askTopic}
            onMore={showMore}
          />
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
          onKeyDown={(event) => event.key === 'Enter' && askTyped()}
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
