/** A sign-in page's ?redirect: the page to open after signing in (auth/session.ts). */
export const redirectSearch = (search: Record<string, unknown>): { redirect?: string } =>
  typeof search.redirect === 'string' ? { redirect: search.redirect } : {}
