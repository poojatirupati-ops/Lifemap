import type { Message } from './useAskChat.ts'

/** One message: the customer's on the right, LifeMap's (or its typing dots) on the left. */
export default function ChatBubble({ message }: { message: Message }) {
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
