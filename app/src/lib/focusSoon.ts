/** Focuses an element once React has drawn it (a new item's first field, the Add button). */
export const focusSoon = (selector: string) =>
  requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus())
