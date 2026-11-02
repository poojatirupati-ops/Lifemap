import { createFileRoute } from '@tanstack/react-router'
import { financesPage } from '../../../../state/finances.ts'
import FinanceSection from '../../../../components/finance/FinanceSection.tsx'

export const Route = createFileRoute('/_auth/build/finances/$section')({
  beforeLoad: ({ params }) => financesPage('/build/finances', params),
  component: FinanceSection,
})
