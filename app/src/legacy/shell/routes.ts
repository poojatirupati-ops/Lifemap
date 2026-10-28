import type { ComponentType } from 'react'
import type { Route } from './route.ts'

type Mod = { default: ComponentType; route?: Route }
const mods = import.meta.glob<Mod>(['../screens/*.tsx', '../screens/*/index.tsx', '!../screens/**/*.test.tsx'], { eager: true })

/** Screens self-register by exporting `route`. */
export const screens = Object.values(mods).flatMap(m => (m.route ? [{ route: m.route, Screen: m.default }] : []))
