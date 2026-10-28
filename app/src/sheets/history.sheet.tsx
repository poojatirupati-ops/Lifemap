import { useStore } from '../state/store.ts'
import CloseButton from './CloseButton.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'history'

export function Body() {
  const versions = useStore((store) => store.plan.versions)
  return (
    <>
      <SheetTitle>Plan history</SheetTitle>
      {versions.map((version, index) => (
        <div className="mini" key={index}>
          <span>
            <b>Version {index + 1}</b> · {version.note}
          </span>
          <span className="small">{version.date}</span>
        </div>
      ))}
      <CloseButton style={{ marginTop: 12 }}>Close</CloseButton>
    </>
  )
}
