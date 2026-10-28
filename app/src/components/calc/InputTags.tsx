import type { StandardTagKind } from './FieldInfo.ts'

interface Props {
  fromStatement?: boolean
  workedOut?: boolean
  missing?: 'chosen' | 'added' | null
  standard?: StandardTagKind
}

/** The tags after an input's label: From your statement, Worked out, Not chosen yet, Set by LifeMap. */
export default function InputTags({ fromStatement, workedOut, missing, standard }: Props) {
  return (
    <>
      {fromStatement && (
        <>
          {' '}
          <span className="tag doc">From your statement</span>
        </>
      )}
      {workedOut && (
        <>
          {' '}
          <span className="tag pre">Worked out from your figures</span>
        </>
      )}
      {missing && (
        <>
          {' '}
          <span className="tag look">
            {missing === 'chosen' ? 'Not chosen yet' : 'Not added yet'}
          </span>
        </>
      )}
      {standard && (
        <>
          {' '}
          <span className={standard === 'mine' ? 'tag doc' : 'tag pre'}>
            {standard === 'mine' ? 'Your choice' : 'Set by LifeMap'}
          </span>
        </>
      )}
    </>
  )
}
