// matchMedia is optional only for jsdom, which has none (motion then counts as on).
export const prefersReducedMotion = () =>
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
