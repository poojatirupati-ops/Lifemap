import { byDecade } from '../../domain/planning/chapters'
import type { YearRow } from '../../domain/planning/project'
import { useStore } from '../../state/store'
import type { Goal } from '../../state/types'
import ChapterCard from './ChapterCard'

interface Props {
  rows: YearRow[]
  goals: Goal[]
  percent: Record<number, number>
  hasRetireGoal: boolean
}

/** Your future as decades: the weather of each, its goals, and its years on demand. */
export default function Chapters({ rows, goals, percent, hasRetireGoal }: Props) {
  const open = useStore((store) => store.openChapter)
  const update = useStore((store) => store.update)
  // TODO(R-20): a named store action (toggleChapter) once the results slice exists
  const toggle = (index: number) =>
    update((_, ui) => {
      ui.openChapter = open === index ? null : index
    })

  return (
    <div className="chapgrid">
      {byDecade(rows).map((chapter, index) => (
        <ChapterCard
          key={chapter.decade}
          chapter={chapter}
          goals={goals}
          percent={percent}
          hasRetireGoal={hasRetireGoal}
          open={open === index}
          onToggle={() => toggle(index)}
        />
      ))}
    </div>
  )
}
