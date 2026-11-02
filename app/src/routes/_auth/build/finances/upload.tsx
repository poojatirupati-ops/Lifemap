import { createFileRoute } from '@tanstack/react-router'
import { financesPage } from '../../../../state/finances.ts'
import FinanceUpload from '../../../../components/finance/FinanceUpload.tsx'

export const Route = createFileRoute('/_auth/build/finances/upload')({
  beforeLoad: () => financesPage('/build/finances', { upload: true }),
  component: FinanceUpload,
})
