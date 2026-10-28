// Pure rule for what to do right after sign-in. No react, fetch or storage here.
export type Reconcile = 'push' | 'adopt'

/** Server has no plan: carry the local (pre-login) answers up. Server has one: keep the local plan only when this device
 *  has synced with this account before (baseline) and changed it since; otherwise take the server's. */
export const reconcile = (serverHasPlan: boolean, baseline: boolean, localDirty: boolean): Reconcile =>
  !serverHasPlan || (baseline && localDirty) ? 'push' : 'adopt'
