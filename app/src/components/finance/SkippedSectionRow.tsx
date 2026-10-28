import type { FinanceSection } from '../../domain/finances/sections.data.ts'
import Emo from '../ui/Emo.tsx'
import { fixSection, leaveSectionForAdviser } from './financeActions.ts'

interface Props {
  section: FinanceSection
  index: number
  leftForAdviser: boolean
}

/** A section with nothing entered: one row instead of one per field. */
export default function SkippedSectionRow({ section, index, leftForAdviser }: Props) {
  return (
    <div className="ck">
      <span className="i" aria-hidden="true">
        ❓
      </span>
      <div style={{ flex: 1 }}>
        <b>
          <Emo>{`${section.emoji} ${section.title}`}</Emo>
        </b>{' '}
        <span className="small">· skipped</span>
        <div className="small">
          {section.id === 'prot' ? 'Not added yet' : 'Not added yet, so it counts as €0 for now'}
          {leftForAdviser && (
            <>
              {' · '}
              <b>Left for my adviser</b>
            </>
          )}
        </div>
        <div className="a">
          <button className="link" data-a="fix" data-p={index} onClick={() => fixSection(index)}>
            Add now
          </button>
          {!leftForAdviser && (
            <button
              className="link"
              data-a="acksec"
              data-p={section.id}
              onClick={() => leaveSectionForAdviser(section.id)}
            >
              Leave for my adviser
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
