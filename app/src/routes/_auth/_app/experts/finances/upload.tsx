import { createFileRoute } from '@tanstack/react-router'
import { financesPage } from '../../../../../state/finances.ts'
import FinanceUpload from '../../../../../components/finance/FinanceUpload.tsx'

export const Route = createFileRoute('/_auth/_app/experts/finances/upload')({
  beforeLoad: () => financesPage('/experts/finances', { upload: true }),
  component: FinanceUpload,
})
