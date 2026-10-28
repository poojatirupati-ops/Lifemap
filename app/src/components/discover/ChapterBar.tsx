import { CHAPTERS, DISCOVER_SIX } from '../../domain/discovery/questions.data.ts'
import { useStore } from '../../state/store.ts'

const chapters = Object.keys(CHAPTERS).map(Number)

/** One bar per chapter, filled by the share of its questions answered. */
export default function ChapterBar() {
  const answers = useStore((store) => store.plan.ans)
  return (
    <div className="chaps" aria-hidden="true">
      {chapters.map((chapter) => {
        const questions = DISCOVER_SIX.filter((q) => q.chapter === chapter)
        const answered = questions.filter((q) => answers[q.id] != null).length
        return (
          <i key={chapter}>
            <b style={{ width: `${(answered / questions.length) * 100}%` }} />
          </i>
        )
      })}
    </div>
  )
}
