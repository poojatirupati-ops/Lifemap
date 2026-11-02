import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { queryClient } from '../auth/planSync.ts'

/** GET /api/tenant: branding, resolved feature flags and whether the tenant signs in through its own identity provider (SSO). */
const tenantSchema = z.object({
  slug: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  colors: z.record(z.string(), z.string()),
  features: z.record(z.string(), z.boolean()),
  sso: z.boolean().optional(),
})
export type Tenant = z.infer<typeof tenantSchema>
export type Feature = 'ask' | 'adviserBooking' | 'documentUpload' | 'analytics'

/** One cache for GET /api/tenant: every module reads it under this key. */
export const TENANT_KEY = ['tenant']

export const tenantQuery = {
  queryKey: TENANT_KEY,
  queryFn: async () => tenantSchema.parse(await (await fetch('/api/tenant')).json()),
  staleTime: Infinity,
}

/** The tenant for this host; undefined while loading (LifeMap Direct's look meanwhile). */
export const useTenant = () => useQuery(tenantQuery, queryClient).data

/** For hook-free heads (called as functions): the tenant once loaded. */
export const loadedTenant = () => queryClient.getQueryData<Tenant>(TENANT_KEY)

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
