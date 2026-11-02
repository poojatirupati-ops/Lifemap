import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Area } from '../../shell/Screen.tsx'

// The app: Home, Explore, My Plan, Me and Experts, with the tab bar under each screen.
export const Route = createFileRoute('/_auth/_app')({
  component: () => (
    <Area value="app">
      <Outlet />
    </Area>
  ),
})
