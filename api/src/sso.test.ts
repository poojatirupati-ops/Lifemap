import { generateKeyPairSync, sign } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { afterEach, expect, test, vi } from "vitest";
import { member, organization, ssoProvider, user } from "./db/schema";
import { testApp } from "./testing";

afterEach(() => vi.unstubAllGlobals());

const ISSUER = "https://idp.cu-a.example";
const A = { "x-forwarded-host": "app.cu-a.example" };

/** A mock OIDC issuer: /token returns an RS256 ID token for whatever claims the test sets next, /jwks serves the key. */
const mockIssuer = () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const idToken = (claims: Record<string, unknown>) => {
    const now = Math.floor(Date.now() / 1000);
    const body = `${b64({ alg: "RS256", kid: "k1", typ: "JWT" })}.${b64({ iss: ISSUER, aud: "lifemap", iat: now, exp: now + 300, ...claims })}`;
    return `${body}.${sign("sha256", Buffer.from(body), privateKey).toString("base64url")}`;
  };
  const issuer = { claims: {} as Record<string, unknown> };
  const realFetch = globalThis.fetch;
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.origin !== ISSUER) return realFetch(input, init);
    if (url.pathname === "/jwks") return Response.json({ keys: [{ ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" }] });
    return Response.json({ access_token: "at", token_type: "Bearer", expires_in: 300, id_token: idToken(issuer.claims) });
  });
  return issuer;
};

test("SSO: tenant A's OIDC provider signs staff into A with the mapped role; other domains are refused", async () => {
  const { req, login, db } = await testApp();
  await db.insert(organization).values({ id: "org-a", name: "Credit Union A", slug: "cu-a", metadata: JSON.stringify({ host: "app.cu-a.example" }) });
  const admin = await login("it@cu-a.example", A);
  await db.update(member).set({ role: "admin" }).where(eq(member.organizationId, "org-a"));
  const customer = await login("someone@example.com", A);

  const provider = {
    providerId: "cu-a-entra", issuer: ISSUER, domain: "cu-a.example", organizationId: "org-a",
    oidcConfig: {
      clientId: "lifemap", clientSecret: "secret", skipDiscovery: true, pkce: true,
      authorizationEndpoint: `${ISSUER}/authorize`, tokenEndpoint: `${ISSUER}/token`, jwksEndpoint: `${ISSUER}/jwks`,
      mapping: { extraFields: { lifemapRole: "lifemap_role" } },
    },
  };
  const register = (cookie: string, body: object) => req("/api/auth/sso/register", { method: "POST", body }, cookie);
  expect((await register(admin, { ...provider, organizationId: undefined })).status).toBe(403); // no personal providers
  expect((await register(customer, provider)).status).toBe(403); // only the tenant's admins
  expect((await register(admin, provider)).status).toBe(200);

  const issuer = mockIssuer();
  /** Browser round trip: start sign-in, the IdP "authenticates" `claims`, come back on the callback. Returns the final redirect and cookies. */
  const ssoSignIn = async (claims: Record<string, unknown>) => {
    const start = await req("/api/auth/sign-in/sso", { method: "POST", body: { providerId: "cu-a-entra", callbackURL: "http://localhost:3000/home" } });
    if (!start.ok) return { status: start.status, location: "", cookie: "" };
    const state = new URL(((await start.json()) as { url: string }).url).searchParams.get("state")!;
    const jar = start.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    issuer.claims = claims;
    const back = await req(`/api/auth/sso/callback/cu-a-entra?code=c0de&state=${state}`, {}, jar);
    return { status: back.status, location: back.headers.get("location") ?? "", cookie: back.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ") };
  };

  // Not usable until the tenant proves the domain (DNS TXT; done by hand here).
  expect((await ssoSignIn({ sub: "1", email: "ann@cu-a.example" })).status).toBe(401);
  await db.update(ssoProvider).set({ domainVerified: true }).where(eq(ssoProvider.providerId, "cu-a-entra"));

  const roleOf = async (email: string) =>
    (await db.select({ role: member.role, org: member.organizationId }).from(member).innerJoin(user, eq(user.id, member.userId)).where(eq(user.email, email)));

  const ann = await ssoSignIn({ sub: "1", email: "ann@cu-a.example", name: "Ann" });
  expect(ann.location).toBe("http://localhost:3000/home");
  expect(await roleOf("ann@cu-a.example")).toEqual([{ role: "customer", org: "org-a" }]); // default: customer
  const session = (await (await req("/api/auth/get-session", {}, ann.cookie)).json()) as { session: { activeOrganizationId: string } };
  expect(session.session.activeOrganizationId).toBe("org-a");
  expect((await req("/api/plan", { method: "PUT", body: { version: 0, plan: { whyNote: "x" } } }, ann.cookie)).status).toBe(200);

  await ssoSignIn({ sub: "2", email: "boss@cu-a.example", lifemap_role: "admin" });
  expect(await roleOf("boss@cu-a.example")).toEqual([{ role: "admin", org: "org-a" }]); // admin only by explicit mapping

  // An identity from another domain cannot use tenant A's provider: no session, no user, no membership.
  const mallory = await ssoSignIn({ sub: "3", email: "mallory@gmail.com", lifemap_role: "admin" });
  expect(mallory.location).toContain("error=email_domain_not_allowed");
  expect(mallory.cookie).not.toMatch(/session_token=[^;]/);
  expect(await db.select().from(user).where(eq(user.email, "mallory@gmail.com"))).toEqual([]);
  // ...including a known user whose IdP email later moves off the domain.
  const moved = await ssoSignIn({ sub: "1", email: "ann@elsewhere.example" });
  expect(moved.location).toContain("error=email_domain_not_allowed");
  expect(await db.select().from(member).where(and(eq(member.organizationId, "org-a"), eq(member.role, "admin")))).toHaveLength(2);
});
