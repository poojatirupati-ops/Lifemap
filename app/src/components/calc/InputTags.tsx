import { Fragment } from 'react'
import type { StandardTag } from '../../domain/calc/guide.ts'

interface Props {
  fromStatement?: boolean
  workedOut?: boolean
  missing?: 'chosen' | 'added' | null
  standard?: StandardTag
}

/** The tags after an input's label: From your statement, Worked out, Not chosen yet, Set by LifeMap. */
export default function InputTags({ fromStatement, workedOut, missing, standard }: Props) {
  const tags: [className: string, text: string][] = []
  if (fromStatement) tags.push(['tag doc', 'From your statement'])
  if (workedOut) tags.push(['tag pre', 'Worked out from your figures'])
  if (missing) tags.push(['tag look', missing === 'chosen' ? 'Not chosen yet' : 'Not added yet'])
  if (standard)
    tags.push(standard === 'mine' ? ['tag doc', 'Your choice'] : ['tag pre', 'Set by LifeMap'])
  return tags.map(([className, text]) => (
    <Fragment key={text}>
      {' '}
      <span className={className}>{text}</span>
    </Fragment>
  ))
}
