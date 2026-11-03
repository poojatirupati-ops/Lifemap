import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { AUTH, type Auth } from "../auth";
import { DB, type Db } from "../db";
import { organization } from "../db/schema";
import { DIRECT_ORG_ID, mergeTenantConfig, publicConfig, tenantById } from "../tenant";

/** White-label config of the active tenant, and platform-admin config changes. Flags and config validation: src/tenant.ts. */
@Injectable()
export class TenantService {
  constructor(@Inject(DB) private readonly db: Db, @Inject(AUTH) private readonly auth: Auth) {}

  /** The session's active tenant; LifeMap Direct without a session or active tenant. */
  async current(headers: Headers) {
    const active = (await this.auth.api.getSession({ headers }))?.session.activeOrganizationId;
    return publicConfig(this.db, (active && (await tenantById(this.db, active))) || (await tenantById(this.db, DIRECT_ORG_ID)));
  }

  /** Merges a config change into tenant `id` (throws Better Auth's APIError when invalid); undefined when there is no such tenant. */
  async update(id: string, change: { logo?: string | null; metadata?: unknown }) {
    if (!(await tenantById(this.db, id))) return undefined;
    const metadata = await mergeTenantConfig(this.db, id, change);
    await this.db.update(organization).set({
      ...(change.logo !== undefined && { logo: change.logo }),
      ...(metadata && { metadata: JSON.stringify(metadata) }),
    }).where(eq(organization.id, id));
    return publicConfig(this.db, await tenantById(this.db, id));
  }
}
