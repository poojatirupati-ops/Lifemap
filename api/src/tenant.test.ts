import { and, eq } from "drizzle-orm";
import { expect, test, vi } from "vitest";
import { member, organization, planRow, user } from "./db/schema";
import { FEATURE_DEFAULTS, isEnabled } from "./tenant";
import { testApp } from "./testing";

// PostHog client stub: flags per organization group, used once POSTHOG_API_KEY is set.
const groups = vi.hoisted(() => ({}) as Record<string, Record<string, boolean>>);
vi.mock("posthog-node", () => ({ PostHog: class { waitForLocalEvaluationReady = async () => true; getAllFlags = async (_: string, o: { groups: { organization: string } }) => groups[o.groups.organization] ?? {}; } }));

const A = { "x-forwarded-host": "app.cu-a.example" };
const B = { "x-forwarded-host": "app.cu-b.example" };

const tenants = async () => {
  const t = await testApp();
  await t.db.insert(organization).values([
    { id: "org-a", name: "Credit Union A", slug: "cu-a", metadata: JSON.stringify({ host: "app.cu-a.example" }) },
    { id: "org-b", name: "Credit Union B", slug: "cu-b", metadata: JSON.stringify({ host: "app.cu-b.example" }) },
  ]);
  const activeOrg = async (cookie: string) =>
    ((await (await t.req("/api/auth/get-session", {}, cookie)).json()) as { session: { activeOrganizationId: string } }).session.activeOrganizationId;
  const roleIn = async (email: string, orgId: string) =>
    (await t.db.select({ role: member.role }).from(member).innerJoin(user, eq(user.id, member.userId))
      .where(and(eq(user.email, email), eq(member.organizationId, orgId))))[0]?.role;
  return { ...t, activeOrg, roleIn };
};

test("sign-in lands in LifeMap Direct, or in the host's tenant as customer", async () => {
  const { login, activeOrg, roleIn } = await tenants();
  expect(await activeOrg(await login("indie@example.com"))).toBe("lifemap-direct");
  expect(await roleIn("indie@example.com", "lifemap-direct")).toBe("customer");
  expect(await activeOrg(await login("cust@example.com", A))).toBe("org-a");
  expect(await roleIn("cust@example.com", "org-a")).toBe("customer");
  expect(await roleIn("cust@example.com", "lifemap-direct")).toBeUndefined();
});

test("GET /api/tenant: public config by host, LifeMap Direct otherwise", async () => {
  const { req } = await tenants();
  expect(await (await req("/api/tenant", { headers: A })).json()).toMatchObject({ id: "org-a", name: "Credit Union A", slug: "cu-a" });
  expect(await (await req("/api/tenant", { headers: { "x-forwarded-host": "APP.CU-B.example:443" } })).json()).toMatchObject({ id: "org-b" });
  expect(await (await req("/api/tenant", { headers: { "x-forwarded-host": "evil.example" } })).json()).toMatchObject({ id: "lifemap-direct", colors: {}, features: FEATURE_DEFAULTS });
  expect(await (await req("/api/tenant")).json()).toMatchObject({ id: "lifemap-direct" });
});

test("isolation: plans and consents per tenant and per user; no switching into a tenant you are not in", async () => {
  const { req, login, db } = await tenants();
  const [a, b] = [await login("ann@example.com", A), await login("bob@example.com", B)];
  const plan = (whyNote: string) => ({ version: 0, plan: { whyNote } });
  expect((await req("/api/plan", { method: "PUT", body: plan("A-SECRET") }, a)).status).toBe(200);
  await req("/api/consents", { method: "POST", body: { notice: "a1", marketing: { granted: true, version: "m1" } } }, a);
  expect((await req("/api/plan", { method: "PUT", body: plan("B-SECRET") }, b)).status).toBe(200);

  // Customer of A cannot make B (or Direct) active, so cannot reach B's data; a refused switch leaves no tenant (fail closed) until A is chosen again.
  const setActive = (organizationId: string) => req("/api/auth/organization/set-active", { method: "POST", body: { organizationId } }, a);
  for (const organizationId of ["org-b", "lifemap-direct"]) {
    expect((await setActive(organizationId)).status).toBe(403);
    expect((await req("/api/plan", {}, a)).status).toBe(403);
  }
  expect((await setActive("org-a")).status).toBe(200);
  expect(await (await req("/api/plan", {}, a)).json()).toMatchObject({ plan: { whyNote: "A-SECRET" } });
  expect(await (await req("/api/plan", {}, b)).json()).toMatchObject({ plan: { whyNote: "B-SECRET" } });
  expect(await (await req("/api/consents", {}, b)).json()).toEqual({ consents: {}, notice: null });

  // The same person signing in on B joins B too and gets a separate, empty plan there; A's stays untouched.
  const a2 = await login("ann@example.com", B);
  expect(await (await req("/api/plan", {}, a2)).json()).toEqual({ version: 0, plan: null });
  expect((await req("/api/me/export", {}, a2)).ok).toBe(true);
  expect(await (await req("/api/me/export", {}, a2)).text()).not.toMatch(/A-SECRET|B-SECRET|"a1"/);
  await req("/api/plan", { method: "PUT", body: plan("A-IN-B") }, a2);
  expect(await (await req("/api/plan", {}, a)).json()).toMatchObject({ plan: { whyNote: "A-SECRET" } });

  // Second wall: the database refuses a tenant row without a membership.
  const [ann] = await db.select().from(user).where(eq(user.email, "ann@example.com"));
  await expect(db.insert(planRow).values({ userId: ann.id, organizationId: "lifemap-direct", version: 1, data: {} as never })).rejects.toThrow();
});

test("flags: code defaults without PostHog; with it, the organization group's flags override them", async () => {
  const { req } = await tenants();
  const flagsOf = async (headers: Record<string, string>) => ((await (await req("/api/tenant", { headers })).json()) as { features: unknown }).features;
  groups["org-a"] = { ask: false, adviserBooking: true };
  expect(await flagsOf(A)).toEqual(FEATURE_DEFAULTS); // no POSTHOG_API_KEY
  process.env.POSTHOG_API_KEY = "phc_test";
  try {
    expect(await flagsOf(A)).toEqual({ ...FEATURE_DEFAULTS, ask: false, adviserBooking: true });
    expect(await flagsOf(B)).toEqual(FEATURE_DEFAULTS);
    expect([await isEnabled({ id: "org-a" }, "adviserBooking"), await isEnabled({ id: "org-b" }, "adviserBooking")]).toEqual([true, false]);
  } finally {
    delete process.env.POSTHOG_API_KEY;
  }
});

test("tenant admin updates own tenant's branding only; customers and bad config refused; host is platform-only", async () => {
  const { req, login, db } = await tenants();
  const adm = await login("staff@cu-a.example", A);
  await db.update(member).set({ role: "admin" }).where(eq(member.organizationId, "org-a"));
  const cust = await login("cust@example.com", A);
  const update = (cookie: string, organizationId: string, data: unknown) =>
    req("/api/auth/organization/update", { method: "POST", body: { organizationId, data } }, cookie);
  const tenantA = async () => (await (await req("/api/tenant", { headers: A })).json()) as Record<string, unknown>;

  const brand = { name: "CU A", logo: "https://cdn.cu-a.example/logo.svg", metadata: { colors: { primary: "#0a3d62" }, rates: { growth: 0.04 } } };
  expect((await update(adm, "org-a", brand)).status).toBe(200);
  expect(await tenantA()).toEqual({ id: "org-a", slug: "cu-a", name: "CU A", logo: brand.logo, colors: { primary: "#0a3d62" }, features: FEATURE_DEFAULTS, rates: { growth: 0.04 }, sso: false });
  const [orgA] = await db.select().from(organization).where(eq(organization.id, "org-a"));
  expect(JSON.parse(orgA.metadata!).host).toBe("app.cu-a.example"); // a partial update keeps the host

  // Tenant A's admin cannot touch B (plugin: not a member, 400); A's customers cannot touch A.
  expect((await update(adm, "org-b", { metadata: { colors: { primary: "#000" } } })).status).toBe(400);
  expect((await update(cust, "org-a", { metadata: { colors: { primary: "#000" } } })).status).toBe(403);
  // Flags are no longer tenant config (PostHog, LifeMap staff only).
  for (const bad of [{ logo: "javascript:alert(1)" }, { metadata: { colors: { primary: "red;}" } } }, { metadata: { script: "x" } }, { metadata: { features: { ask: false } } }])
    expect((await update(adm, "org-a", bad)).status, JSON.stringify(bad)).toBe(400);
  expect((await update(adm, "org-a", { metadata: { host: "app.cu-b.example" } })).status).toBe(403);

  // Platform admins: create tenants and change any tenant's config (host too) without membership; nobody else can.
  expect((await req("/api/auth/organization/create", { method: "POST", body: { name: "X", slug: "x" } }, cust)).status).toBe(403);
  const patch = (cookie: string, id: string, body: unknown) => req(`/api/admin/organizations/${id}/config`, { method: "PATCH", body }, cookie);
  expect((await patch(adm, "org-b", { metadata: { colors: { primary: "#000" } } })).status).toBe(403);
  const ops = await login("ops@lifemap.example");
  await db.update(user).set({ role: "admin" }).where(eq(user.email, "ops@lifemap.example"));
  expect((await req("/api/auth/organization/create", { method: "POST", body: { name: "CU C", slug: "cu-c", metadata: { host: "app.cu-c.example" } } }, ops)).status).toBe(200);
  expect(((await (await req("/api/tenant", { headers: { "x-forwarded-host": "app.cu-c.example" } })).json()) as { slug: string }).slug).toBe("cu-c");
  expect((await patch(ops, "org-b", { metadata: { rates: { growth: 0.05 } } })).status).toBe(200);
  expect(((await (await req("/api/tenant", { headers: B })).json()) as { rates: unknown }).rates).toEqual({ growth: 0.05 });
  expect((await patch(ops, "org-b", { metadata: { host: "app.cu-a.example" } })).status).toBe(400); // host taken
  expect((await patch(ops, "org-b", { metadata: { features: { adviserBooking: true } } })).status).toBe(400);
  expect((await patch(ops, "missing", {})).status).toBe(404);

  // ...and no customer data: impersonation is refused.
  const [c] = await db.select().from(user).where(eq(user.email, "cust@example.com"));
  expect((await req("/api/auth/admin/impersonate-user", { method: "POST", body: { userId: c.id } }, ops)).ok).toBe(false);
});

test("DELETE /api/me in one tenant erases only that tenant's records when the user is also in another", async () => {
  const { req, login, db, roleIn } = await tenants();
  const direct = await login("both@example.com");
  const inA = await login("both@example.com", A);
  for (const cookie of [direct, inA]) {
    await req("/api/plan", { method: "PUT", body: { version: 0, plan: { whyNote: "x" } } }, cookie);
    await req("/api/consents", { method: "POST", body: { notice: "n1" } }, cookie);
  }
  const res = await req("/api/me", { method: "DELETE" }, inA);
  expect(res.status).toBe(200);
  expect(await roleIn("both@example.com", "org-a")).toBeUndefined();
  expect((await req("/api/plan", {}, inA)).status).toBe(403); // that session no longer has a tenant
  expect(await (await req("/api/plan", {}, direct)).json()).toMatchObject({ version: 1 });
  expect(((await (await req("/api/consents", {}, direct)).json()) as { notice: unknown }).notice).toBeTruthy();
  expect((await db.select().from(planRow)).map((p) => p.organizationId)).toEqual(["lifemap-direct"]);
});
