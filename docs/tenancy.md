# Tenancy

LifeMap serves independent users and partner tenants (credit unions, white-label and channel partners) from one API and one database. Tenants are Better Auth **organizations**. All tenancy uses the plugins' own tables (`organization`, `member`, `invitation`, `sso_provider`) and the admin plugin's user fields. There is no separate tenant layer. Code: `api/src/auth.ts` (plugins and hooks), `api/src/tenant.ts` (host resolution, config, flags via PostHog), `api/src/guard.ts`. Migration: `api/drizzle/0003_tenancy.sql`.

## Model

| Who | How it is stored | Gets |
|---|---|---|
| Platform admin (LifeMap staff) | `user.role = 'admin'` (admin plugin) | Creates tenants and edits any tenant's config. Switches feature flags per tenant in PostHog. Cannot impersonate users (refused). Has no route to other people's plans or consents. |
| Independent user | `member` of **LifeMap Direct** (`organization.id = 'lifemap-direct'`), role `customer` | Their own data in LifeMap Direct. |
| Tenant staff | `member` of the tenant, role `admin` | Edit their own tenant's branding and rates, and register its SSO provider. Cannot change feature flags. Cannot read customers' plans. |
| Tenant customer | `member` of the tenant, role `customer` | Their own data in that tenant. |
| Adviser firm (later) | Another organization (for example `metadata.kind = 'adviser'`) | Not built. |

One person (one `user`, one email) can belong to several tenants. They have a separate plan, consent history and notice acknowledgement in each one.

### Roles and permissions (organization plugin access control)

| Permission | `admin` (tenant staff) | `customer` |
|---|---|---|
| `organization:update` (name, logo, metadata: colours, rates) | yes | no |
| Register or manage the tenant's SSO provider (plugin checks the `admin` role) | yes | no |
| Members and invitations | no (not needed yet) | no |
| Read other members' plans or consents | no (no route exists) | no |
| Own plan, consents, export, erasure | yes | yes |

Only platform admins can create organizations (`allowUserToCreateOrganization`). The creator becomes the tenant's `admin`.

## Host resolution and sign-in

- The tenant comes from the request host, `X-Forwarded-Host` first, then `Host`. It is matched against `metadata.host`, which is unique in Postgres through an expression index. The CDN must **overwrite** `X-Forwarded-Host`. Unknown hosts fall back to LifeMap Direct.
- On every new session (email OTP, passkey), a `databaseHooks.session.create.before` hook adds the user to that host's tenant as `customer` if they are not already a member. It also sets `session.activeOrganizationId`.
- For SSO sign-ins, the active organization is the provider's organization. The SSO plugin then adds the membership with the mapped role.
- A tenant's own `https://<host>` is a trusted origin for requests made on it.
- Switching tenant uses the plugin's `organization/set-active`, which checks membership. A refused switch clears the active tenant (fail closed).

## Data isolation

- Every tenant-owned row (`plan`, `consent_event`, `notice_ack`) carries `organization_id`. Every query filters by the session's `userId` **and** `activeOrganizationId`. The guard returns 401 without a session and 403 without an active tenant.
- **Second wall, in the database:** those rows have a composite foreign key `(organization_id, user_id) → member` with `ON DELETE CASCADE`. Postgres refuses tenant data for someone who is not a member. Removing the membership, or the user, removes that tenant's data.
- **Row-level security: deferred.** RLS would need a per-request `set_config` inside a transaction on every query. That fits poorly with the single pooled connection behind RDS Proxy, and the app role owns the tables, so policies would need `FORCE`. Revisit it with a non-owner app role.

## White-label config and feature flags

Branding, host and rates are stored in the plugin's `organization.metadata` JSON, validated by one zod schema (`tenantMetadata` in `api/src/tenant.ts`):

```json
{ "host": "app.cu-a.ie", "colors": { "primary": "#0a3d62" }, "rates": { "growth": 0.04 } }
```

`name` and `logo` (https only) are the plugin's own columns. An update merges top-level keys over the stored config. Unknown keys (including the old `features`) and bad values get 400.

- `GET /api/tenant` is public and needs no session. It returns `{ id, slug, name, logo, colors, features, rates }` for the current host. `features` is resolved on the server (PostHog, then code defaults), so the browser never calls PostHog for flags and flags work without analytics consent.
- Tenant admins: `POST /api/auth/organization/update` `{ organizationId, data: { name?, logo?, metadata? } }`. This works for their own tenant only. They cannot change `host` (403).
- Platform admins: `PATCH /api/admin/organizations/:id/config` `{ logo?, metadata? }`. This works for any tenant, including `host`.

### Feature flags

| Flag | Default | Gates |
|---|---|---|
| `ask` | on | The "Ask" questions screen |
| `adviserBooking` | off | Creating adviser bookings and share consents, `POST /api/bookings` (F4; legal sign-off on G-12 still needed) |
| `documentUpload` | off | Real document upload, `POST /api/documents` (F3). Listing, reading and deleting stay open so people can always reach and erase their files |

| `analytics` | on | PostHog product analytics for the tenant's users (each user must still opt in) |

**Managed by LifeMap staff in PostHog** (EU Cloud, `https://eu.i.posthog.com`). Each flag is a PostHog feature flag with the same key, aggregated by the group type `organization`; the group key is the organization id (for example `lifemap-direct`, `org-a`). To switch a flag for one tenant, add a release condition on that group. Tenant admins cannot change flags; there is no API for it.

The API evaluates flags with `posthog-node` **local evaluation**: it polls the flag definitions with a personal API key and evaluates them in process, so no per-request call to PostHog. If PostHog is unreachable it keeps using the last definitions it fetched; before any have loaded, or for a flag PostHog does not return, the code default applies. Without `POSTHOG_API_KEY` (dev, tests) only code defaults apply. Production secrets (SST): `PosthogProjectKey` and `PosthogPersonalApiKey` (`npx sst secret set ...`); `api/src/lambda.ts` passes them on.

Server code checks a flag with `await isEnabled(org, "flag")` or the `requireFeature(db, "flag")` route middleware (`api/src/tenant.ts`).

**To add a flag:** add `name: default` to `FEATURE_DEFAULTS` in `api/src/tenant.ts`, create the flag in PostHog (group type `organization`) if any tenant needs a non-default value, then add a row to the table above. No migration is needed.

## SSO (per-tenant identity providers)

The SSO plugin (`@better-auth/sso`) handles OIDC (Microsoft Entra ID, Google Workspace, Okta) and SAML.

- A tenant admin registers the provider with `POST /api/auth/sso/register` and an `organizationId`. Providers without an organization are refused, and the plugin also requires the caller to be that tenant's admin.
- **Domain verification is on.** The tenant publishes the issued token as a DNS TXT record at `_better-auth-token-<providerId>.<domain>`, then calls `POST /api/auth/sso/verify-domain`. Until then the provider cannot sign anyone in.
- Only emails on the provider's domain(s) are admitted (`user.validateUserInfo`). This applies on sign-up, account link and every sign-in. Anyone else is redirected with `error=email_domain_not_allowed`.
- Role mapping: everyone is a `customer`, unless the provider maps a claim to `lifemapRole` (`oidcConfig.mapping.extraFields: { lifemapRole: "<claim>" }`) and that claim equals `"admin"`.
- Email OTP and passkeys still work for everyone. Google and Apple social sign-in are not added yet: Apple needs a generated client secret and both need app work.

## GDPR (for the lawyer)

- **Export** (`GET /api/me/export`) returns the person's account, sessions and passkeys, plus the active tenant's plan, consents and notices. It never includes another tenant's records.
- **Erasure** (`DELETE /api/me`) depends on how many tenants the person belongs to:
  - Only one tenant: the whole account is erased, as before (marker, OTP rows, cascade).
  - Also in other tenants: only this tenant's membership is removed. That cascades to its plan, consents and notices. The account stays for the other tenants.
- **Controller and processor.** For LifeMap Direct, LifeMap is the controller. For a partner tenant, the working assumption is that the partner (for example the credit union) is the controller of its customers' data and LifeMap is its processor under an Art. 28 DPA. Partner staff still have no access to customers' plans until a separate permission **and** a customer consent exist (not built). The lawyer should confirm:
  - this split, and whether any tenant is a joint controller;
  - which notice each tenant shows (notice acknowledgements are already stored per tenant);
  - how platform-admin access is logged.
- Platform admins can list accounts (name, email) through the admin plugin. That is account data, not plan data, and it should appear in the ROPA.
