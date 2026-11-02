import { createFileRoute } from '@tanstack/react-router'
import ExpertsPage from '../../../../components/experts/ExpertsPage.tsx'

export const Route = createFileRoute('/_auth/_app/experts/')({ component: () => <ExpertsPage /> })
