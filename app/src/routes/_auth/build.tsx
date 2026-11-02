import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Area } from '../../shell/Screen.tsx'
import { useStore } from '../../state/store.ts'

// The plan builder's 8 steps: no tab bar; My Plan and "Carry on" resume at the last step seen.
export const Route = createFileRoute('/_auth/build')({
  beforeLoad: ({ location }) => {
    if (useStore.getState().plan.hasResults) throw redirect({ to: '/plan' })
    useStore.setState({ planBuilder: true, builderAt: location.href })
  },
  component: () => (
    <Area value="build">
      <Outlet />
    </Area>
  ),
})
