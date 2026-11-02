import { createFileRoute, notFound } from '@tanstack/react-router'
import ExpertsPage from '../../../../components/experts/ExpertsPage.tsx'

const STEPS = ['c0', 'c1', 'c2', 'c3', 'c4'] as const

// /experts/c0 to /experts/c4: the booking steps
export const Route = createFileRoute('/_auth/_app/experts/$stage')({
  params: {
    parse: ({ stage }) => {
      const step = STEPS.find((each) => each === stage)
      if (!step) throw notFound()
      return { stage: step }
    },
    stringify: ({ stage }) => ({ stage }),
  },
  component: Step,
})

function Step() {
  return <ExpertsPage step={Route.useParams().stage} />
}
