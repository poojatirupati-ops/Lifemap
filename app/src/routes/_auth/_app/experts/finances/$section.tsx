import { createFileRoute } from '@tanstack/react-router'
import { financesPage } from '../../../../../state/finances.ts'
import FinanceSection from '../../../../../components/finance/FinanceSection.tsx'

export const Route = createFileRoute('/_auth/_app/experts/finances/$section')({
  beforeLoad: ({ params }) => financesPage('/experts/finances', params),
  component: FinanceSection,
})
