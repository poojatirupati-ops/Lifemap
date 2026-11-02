import { existsSync } from "node:fs";
import { join } from "node:path";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { expect, test, vi } from "vitest";
import { organization } from "../db/schema";
import { s3Files } from "../files";
import { testApp } from "../testing";

// PostHog client stub: flags per organization group, used once POSTHOG_API_KEY is set.
const groups = vi.hoisted(() => ({}) as Record<string, Record<string, boolean>>);
vi.mock("posthog-node", () => ({ PostHog: class { waitForLocalEvaluationReady = async () => true; getAllFlags = async (_: string, o: { groups: { organization: string } }) => groups[o.groups.organization] ?? {}; } }));

const pdf = { name: "statement.pdf", contentType: "application/pdf", size: 5 };
type Created = { document: { id: string }; upload: { url: string; method: string; headers: Record<string, string> } };

test("documents (dev store): upload and read your own; other users and tenants get 404; flag off = 403; erasure deletes the files", async () => {
  const { db, app, req, login, files } = await testApp();
  await db.insert(organization).values({ id: "org-a", name: "CU A", slug: "cu-a", metadata: JSON.stringify({ host: "app.cu-a.example" }) });
  expect((await req("/api/documents")).status).toBe(401);
  const a = await login("a@example.com");
  expect((await req("/api/documents", { method: "POST", body: pdf }, a)).status).toBe(403); // off by default
  process.env.POSTHOG_API_KEY = "phc_test"; // flag on for LifeMap Direct only
  groups["lifemap-direct"] = { documentUpload: true };

  const res = await req("/api/documents", { method: "POST", body: pdf }, a);
  expect(res.status).toBe(201);
  const { document: doc, upload } = (await res.json()) as Created;
  const send = (cookie: string, body: string) => app.request(upload.url, { method: upload.method, headers: { ...upload.headers, cookie }, body });
  expect((await send(a, "too long")).status).toBe(403); // must match the presigned size
  expect((await send(a, "%PDF-")).status).toBe(200);

  const read = async (cookie: string, id = doc.id) => req(`/api/documents/${id}`, {}, cookie);
  const { url } = (await (await read(a)).json()) as { url: string };
  expect(await (await app.request(url, { headers: { cookie: a } })).text()).toBe("%PDF-");
  expect(((await (await req("/api/documents", {}, a)).json()) as { documents: unknown[] }).documents).toHaveLength(1);

  // another user, and the same person in another tenant: nothing listed, no read, no upload, no delete
  const others = [await login("b@example.com"), await login("a@example.com", { "x-forwarded-host": "app.cu-a.example" })];
  for (const other of others) {
    expect(((await (await req("/api/documents", {}, other)).json()) as { documents: unknown[] }).documents).toEqual([]);
    expect((await read(other)).status).toBe(404);
    expect((await app.request(url, { headers: { cookie: other } })).status).toBe(404);
    expect((await send(other, "%PDF-")).status).toBe(404);
    expect((await req(`/api/documents/${doc.id}`, { method: "DELETE" }, other)).status).toBe(404);
  }

  // erasure: the stored file goes with the account
  const path = join(files.dir!, upload.url.replace("/api/dev-files/", ""));
  expect(existsSync(path)).toBe(true);
  expect((await req("/api/me", { method: "DELETE" }, a)).status).toBe(200); // a is in two tenants: Direct's data only
  expect(existsSync(path)).toBe(false);
});

test("documents (S3, mocked): presigned PUT scoped to the caller's key, size and type; erasure deletes the objects", async () => {
  const s3 = mockClient(S3Client);
  s3.on(DeleteObjectsCommand).resolves({});
  const store = s3Files(new S3Client({ region: "eu-west-1", credentials: { accessKeyId: "test", secretAccessKey: "test" } }), "lifemap-docs");
  const { req, login } = await testApp(undefined, store);
  process.env.POSTHOG_API_KEY = "phc_test"; // flag on for LifeMap Direct only
  groups["lifemap-direct"] = { documentUpload: true };
  const a = await login("a@example.com");
  const userId = ((await (await req("/api/me", {}, a)).json()) as { user: { id: string } }).user.id;

  const { document: doc, upload } = (await (await req("/api/documents", { method: "POST", body: pdf }, a)).json()) as Created;
  const put = new URL(upload.url);
  expect(put.hostname).toBe("lifemap-docs.s3.eu-west-1.amazonaws.com");
  expect(put.pathname).toBe(`/lifemap-direct/${userId}/${doc.id}`);
  expect(put.searchParams.get("X-Amz-Expires")).toBe("300");
  expect(put.searchParams.get("X-Amz-SignedHeaders")).toMatch(/content-length.*content-type/);

  expect((await req("/api/me", { method: "DELETE" }, a)).status).toBe(200);
  const deleted = s3.commandCalls(DeleteObjectsCommand).map((c) => c.args[0].input);
  expect(deleted).toEqual([{ Bucket: "lifemap-docs", Delete: { Objects: [{ Key: `lifemap-direct/${userId}/${doc.id}` }], Quiet: true } }]);
  s3.restore();
});
