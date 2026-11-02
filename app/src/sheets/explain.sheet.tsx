import { useMemo } from 'react'
import { findings } from '../domain/planning/findings.ts'
import { goalLineFor } from '../domain/planning/goalLine.ts'
import { useProjection } from '../hooks/useProjection.ts'
import CloseButton from './CloseButton.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'explain'

/** Why we say this is your main strength, gap or biggest decision. */
export function Body({ param }: { param?: string }) {
  const { inputs, base, whatIf } = useProjection()
  const found = useMemo(() => findings(inputs, base.rows, base.percent), [inputs, base])
  const line = useMemo(
    () => (param === 'gap' ? goalLineFor(inputs, base, found.worst, whatIf) : ''),
    [param, inputs, base, found.worst, whatIf],
  )

  const sheets = {
    str: { title: 'Your main strength', text: `${found.strength}. ${found.strengthWhy}` },
    gap: {
      title: 'Your main gap',
      text: `${found.gap}. When that goal comes up, your income and savings won't fully cover the cost with today's plan.${line ? ` ${line}.` : ''}`,
    },
    dec: {
      title: 'Your biggest decision',
      text: (
        <>
          {found.decision}. Try it in <b>What if</b> below to see the effect. This is guidance, not
          advice.
        </>
      ),
    },
  }
  const { title, text } = param === 'str' || param === 'gap' ? sheets[param] : sheets.dec
  return (
    <>
      <SheetTitle>{title}</SheetTitle>
      <p className="sub">{text}</p>
      <CloseButton>Got it</CloseButton>
    </>
  )
}
