import type { ComponentType, ReactNode } from 'react'
import type { Plan } from '../state/types.ts'
import { SCREEN_KEYS, fallbackKey } from './pickScreen.ts'

type ScreenProps = { param?: string }
type FromPlan = (plan: Plan, param?: string) => string

/**
 * What a src/screens/*.screen.tsx exports. `key` is the pickScreen key. `id` and `note` may derive from the plan
 * (e.g. 'D' + (di + 2)); a new id counts as a new screen.
 * Head is hook-free: it is called as a function so splitHead can tell the logo bar from the title.
 */
export type Screen = {
  key: string
  id: string | FromPlan
  note: string | FromPlan
  kind?: 'quiz'
  Head?: (props: ScreenProps) => ReactNode
  Body: ComponentType<ScreenProps>
  Foot?: ComponentType<ScreenProps>
  /** A Foot that depends on the plan (one screen key with several pages, like Me); wins over Foot. */
  footFor?: (plan: Plan) => ComponentType<ScreenProps> | undefined
}

export const resolve = (value: string | FromPlan, plan: Plan, param?: string) =>
  typeof value === 'function' ? value(plan, param) : value

const modules = import.meta.glob<Screen>('../screens/*.screen.tsx', { eager: true })

/** Screen key -> screen module. */
const screens = new Map(Object.values(modules).map((screen) => [screen.key, screen]))

const placeholder = (key: string): Screen => ({
  key,
  id: key,
  note: 'Not converted yet',
  Body: () => (
    <div style={{ padding: 24 }}>
      <h2 tabIndex={-1}>{key}</h2>
      <p>This screen has not been converted yet.</p>
    </div>
  ),
})

/** The screen for a key; a key that is not a screen at all shows the fallback screen instead. */
export function screenFor(key: string, plan: Plan): Screen {
  const screen = screens.get(key)
  if (screen) return screen
  if (SCREEN_KEYS.has(key)) return placeholder(key)
  const fallback = fallbackKey(plan)
  return screens.get(fallback) ?? placeholder(fallback)
}
