import { fieldExamples } from '../../domain/finances/examples.ts'
import { openExample } from './sectionActions.ts'

// which fields have an example; the sentences themselves are built when the sheet opens
const WITH_EXAMPLE = new Set(
  Object.keys(fieldExamples({ statePensionAge: 0, fullPrsiYears: 0, planStartYear: 0 })),
)

/** "Not sure? See an example": shows how the sample customers fill it in; never fills the field. */
export default function ExampleLink({ field }: { field: string }) {
  if (!WITH_EXAMPLE.has(field)) return null
  return (
    <div className="fhelp">
      <button
        className="link"
        data-a="fex"
        data-p={field}
        aria-haspopup="dialog"
        onClick={() => openExample(field)}
      >
        Not sure? See an example
      </button>
    </div>
  )
}
