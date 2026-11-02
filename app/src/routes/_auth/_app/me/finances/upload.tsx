import { createFileRoute } from '@tanstack/react-router'
import { financesPage } from '../../../../../state/finances.ts'
import FinanceUpload from '../../../../../components/finance/FinanceUpload.tsx'

export const Route = createFileRoute('/_auth/_app/me/finances/upload')({
  beforeLoad: () => financesPage('/me/finances', { upload: true }),
  component: FinanceUpload,
})
