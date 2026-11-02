import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '../../../../state/store.ts'

// The Experts tab returns to a booking step under way (c1 to c3); any other Experts page ends that.
export const Route = createFileRoute('/_auth/_app/experts')({
  beforeLoad: ({ location }) =>
    useStore.setState({ resumeBooking: /^\/experts\/(c[123])$/.exec(location.pathname)?.[1] }),
})
