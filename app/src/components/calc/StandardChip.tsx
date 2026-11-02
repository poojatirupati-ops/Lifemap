import type { CSSProperties } from 'react'
import { useStore } from '../../state/store.ts'
import { standardChipText, type FieldInfo } from '../../domain/calc/fieldInfo.ts'

/** A blank figure's one-tap standard (when there is one) and the line on how to choose it. */
export default function StandardChip({ info, style }: { info: FieldInfo; style?: CSSProperties }) {
  const chooseStandard = useStore((store) => store.chooseStandard)
  const { toolId, input, standard } = info
  return (
    <>
      {standard ? (
        <button
          className="chip sm"
          style={style}
          data-a="ckstd"
          data-p={input.key}
          onClick={() => chooseStandard(toolId, input.key)}
        >
          {standardChipText(standard)}
        </button>
      ) : null}
      <span className="small" style={{ display: 'block', marginTop: 4 }}>
        {info.guide}
      </span>
    </>
  )
}
