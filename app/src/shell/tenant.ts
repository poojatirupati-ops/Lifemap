import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { queryClient } from '../auth/planSync.ts'
import { authClient } from '../auth/client.ts'
import { applyTenantFigures, type PartnerFigures } from '../domain/planning/settings.ts'
import type { StandardValue } from '../domain/planning/settings.data.ts'

/** GET /api/tenant: branding, resolved feature flags and whether the tenant signs in through its own identity provider (SSO). */
const tenantSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  colors: z.record(z.string(), z.string()),
  features: z.record(z.string(), z.boolean()),
  sso: z.boolean().optional(),
  /** The tenant's own figures for LifeMap's standards, by standard key. */
  rates: z.record(z.string(), z.union([z.number(), z.string(), z.array(z.number())])).default({}),
})
type Tenant = z.infer<typeof tenantSchema>
type Feature = 'ask' | 'adviserBooking' | 'documentUpload' | 'analytics'

/** One cache for GET /api/tenant: every module reads it under this key. */
export const TENANT_KEY = ['tenant']

export const tenantQuery = {
  queryKey: TENANT_KEY,
  queryFn: async () => tenantSchema.parse(await (await fetch('/api/tenant')).json()),
  staleTime: Infinity,
}

/** The session's active tenant (LifeMap Direct when signed out); undefined while loading (LifeMap Direct's look meanwhile). */
export const useTenant = () => useQuery(tenantQuery, queryClient).data

/** A flag is on unless the tenant turned it off (so nothing flickers away while loading). */
export const useFeature = (flag: Feature) => useTenant()?.features[flag] !== false

/** Paints the tenant's colours over the CSS tokens of the same name (e.g. { "coral": "#123456" } sets --coral). */
export function useBranding() {
  const colors = useTenant()?.colors
  useEffect(() => {
    if (!colors) return
    const root = document.documentElement.style
    for (const [token, value] of Object.entries(colors)) root.setProperty(`--${token}`, value)
    return () => {
      for (const token of Object.keys(colors)) root.removeProperty(`--${token}`)
    }
  }, [colors])
}

/** Puts the tenant's own figures over LifeMap's standards for the planning maths; `onChange` redraws once they change. */
export function useTenantFigures(onChange: () => void) {
  const tenant = useTenant()
  useEffect(() => {
    if (tenant && applyTenantFigures(tenant.name, tenant.rates)) onChange()
  }, [tenant, onChange])
}

/**
 * A tenant admin's change to the active tenant, saved with Better Auth's organization update
 * (the API checks the rates). Shown at once and undone if the save fails; returns the error, if any.
 */
async function updateTenant(change: { name?: string; rates?: PartnerFigures }) {
  const before = queryClient.getQueryData<Tenant>(TENANT_KEY)
  if (!before) return 'the tenant has not loaded'
  const after = { ...before, ...change }
  applyTenantFigures(after.name, after.rates)
  queryClient.setQueryData(TENANT_KEY, after)
  const { error } = await authClient.organization.update({
    organizationId: before.id,
    data: {
      ...(change.name !== undefined && { name: change.name }),
      ...(change.rates && { metadata: { rates: change.rates } }),
    },
  })
  if (!error) return null
  applyTenantFigures(before.name, before.rates)
  queryClient.setQueryData(TENANT_KEY, before)
  return error.message ?? 'it was not saved'
}

/** The partner's name on "Suggested by …": the tenant's name. */
export const renamePartner = (name: string) => updateTenant({ name: name.trim() })

/** The partner's own figure for a standard; null goes back to the LifeMap standard. */
export function setPartnerFigure(key: string, figure: StandardValue) {
  const rates: PartnerFigures = { ...queryClient.getQueryData<Tenant>(TENANT_KEY)?.rates }
  if (figure == null) delete rates[key]
  else rates[key] = figure
  return updateTenant({ rates })
}

/** Every figure back to LifeMap's standards. */
export const backToStandards = () => updateTenant({ rates: {} })
