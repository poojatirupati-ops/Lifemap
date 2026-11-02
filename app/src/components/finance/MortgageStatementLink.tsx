import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'

/** Someone with a mortgage on their home can upload its statement. */
export default function MortgageStatementLink() {
  const hasMortgage = useStore(({ plan }) => plan.figures.home === 'Own with mortgage')
  if (!hasMortgage) return null
  return (
    <button
      className="link"
      data-a="upl"
      data-p="liab"
      onClick={() => useStore.getState().startUpload('liab', ['Sample document.pdf'])}
    >
      <Emo>📄 Upload your mortgage statement (optional)</Emo>
    </button>
  )
}
