import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { jumpById } from '../shell/jumps.data.ts'
import { signInForReview, startFrom } from '../state/shell.ts'

// /jump/<id>: the reviewer panel's jump as a URL (tests/e2e/screens.spec.ts): its plan, then its page.
export const Route = createFileRoute('/jump/$id')({
  beforeLoad: ({ params }) => {
    const jump = jumpById(params.id)
    if (!jump) throw notFound()
    signInForReview()
    startFrom(jump.build())
    throw redirect({ href: jump.to, replace: true })
  },
})
