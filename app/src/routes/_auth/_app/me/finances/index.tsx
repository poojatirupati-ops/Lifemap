import { createFileRoute } from '@tanstack/react-router'
import { financesPage } from '../../../../../state/finances.ts'
import FinanceOverview from '../../../../../components/finance/FinanceOverview.tsx'

export const Route = createFileRoute('/_auth/_app/me/finances/')({
  beforeLoad: () => financesPage('/me/finances'),
  component: FinanceOverview,
})
