// Explore's helpers and the statements that fill in tools (focus areas and live sessions come from the CMS).
import type { CSSProperties } from 'react'
import { EXPERTS } from '../../domain/identity/advisers.data.ts'
import type { Topic, VideoKind } from '../../content/cms.tsx'
import type { CategoryId } from './tools.data.ts'

/** The topic's photo, as the custom properties its .art span reads. */
export const topicPhotoStyle = (topic: Topic) =>
  ({
    '--art': `var(--art-${topic.art})`,
    '--pos': topic.photoPosition ?? undefined,
  }) as CSSProperties

/** "mortgage expert", "financial planner". */
export const expertName = (kind: VideoKind) => EXPERTS[kind].title.toLowerCase()

/** The groups whose tools a statement can fill in, and what the statement is. */
export interface Statement {
  what: string
  reads: string[]
}

export const STATEMENTS: Partial<Record<CategoryId, Statement>> = {
  retire: {
    what: 'pension',
    reads: [
      'Pension benefit statement',
      'Annual pension statement',
      'PRSA statement',
      'Employer scheme / Occupational pension statement',
      'State Pension record (MyWelfare)',
    ],
  },
  home: {
    what: 'mortgage',
    reads: [
      'Mortgage statement',
      'Annual mortgage statement',
      'Mortgage offer letter',
      'Property valuation',
      'LPT record',
    ],
  },
  invest: {
    what: 'investment',
    reads: [
      'Investment / brokerage statement',
      'Fund statement',
      'Share scheme / ESPP / RSU statement',
      'Crypto holdings statement',
    ],
  },
}

/** "a mortgage", "an investment". */
export const withArticle = (word: string) => (/^[aeiou]/i.test(word) ? 'an ' : 'a ') + word
