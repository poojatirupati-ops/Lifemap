import type { Tab } from './route.ts'

/** Onboarding order (sec 12). The first five are the only signed-out screens. route.ts derives the guard targets from it. */
export const flow = ['/welcome', '/why', '/discover', '/reveal', '/sign-in', '/home'] as const

export const tabs: { tab: Tab; path: string; label: string; icon: string }[] = [
  { tab: 'home', path: '/home', label: 'Home', icon: '🏠' },
  { tab: 'explore', path: '/explore', label: 'Explore', icon: '🧭' },
  { tab: 'plan', path: '/plan', label: 'My Plan', icon: '🗺️' },
  { tab: 'me', path: '/me', label: 'Me', icon: '🙂' },
  { tab: 'experts', path: '/experts', label: 'Experts', icon: '💬' },
]
