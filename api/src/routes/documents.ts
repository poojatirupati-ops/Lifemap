import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { validator } from "hono-openapi";
import { z } from "zod";
import type { Db } from "../db";
import { document } from "../db/schema";
import { type Files, removeDocuments } from "../files";
import type { Env } from "../guard";
import { doc, errors } from "../openapi";
import { requireFeature } from "../tenant";

const MAX_SIZE = 10 * 1024 * 1024;
const newDocument = z.object({
  name: z.string().trim().min(1).max(200),
  contentType: z.enum(["application/pdf", "image/jpeg", "image/png", "image/heic", "text/csv"]),
  size: z.number().int().min(1).max(MAX_SIZE),
});
const fields = { id: document.id, name: document.name, contentType: document.contentType, size: document.size, createdAt: document.createdAt };

/**
 * Statements and documents, the caller's in the session's tenant. Objects are keyed `<org>/<user>/<id>`; the key never comes from the client.
 * POST is gated by the tenant's documentUpload flag; list, read and delete always work so people can reach and erase what they have.
 */
export const documentRoutes = (db: Db, files: Files) => {
  const r = new Hono<Env>();
  const mine = (userId: string, orgId: string, id?: string) =>
    and(eq(document.userId, userId), eq(document.organizationId, orgId), id === undefined ? undefined : eq(document.id, id));

  r.post("/documents", doc({
    tags: ["documents"], flag: "documentUpload", summary: "Create a document and get its upload URL",
    description: "PUT the file bytes to `upload.url` with `upload.headers` within 5 minutes. Max 10 MB.",
    responses: { 201: { description: "`{ document, upload: { url, method: \"PUT\", headers } }`" }, 400: errors[400] },
  }), requireFeature(db, "documentUpload"), validator("json", newDocument, (res, c) => (res.success ? undefined : c.json({ error: "invalid document" }, 400))), async (c) => {
    const { userId, orgId } = c.var;
    const { name, contentType, size } = c.req.valid("json");
    const id = randomUUID();
    const key = `${orgId}/${userId}/${id}`;
    // ponytail: the row is written before the upload, so an abandoned upload lists as a document with no file; add an "uploaded" flag (S3 event) if that shows up in the app.
    const [doc] = await db.insert(document).values({ id, userId, organizationId: orgId, key, name, contentType, size }).returning(fields);
    return c.json({ document: doc, upload: { url: await files.putUrl(key, contentType, size), method: "PUT", headers: { "content-type": contentType } } }, 201);
  });

  r.get("/documents", doc({ tags: ["documents"], summary: "The caller's documents", responses: { 200: { description: "`{ documents: [{ id, name, contentType, size, createdAt }] }`, newest first" } } }), async (c) =>
    c.json({ documents: await db.select(fields).from(document).where(mine(c.var.userId, c.var.orgId)).orderBy(desc(document.createdAt)) }));

  r.get("/documents/:id", doc({ tags: ["documents"], summary: "A document and a 5-minute read URL", responses: { 200: { description: "`{ document, url }`" }, 404: errors[404] } }), async (c) => {
    const [doc] = await db.select({ ...fields, key: document.key }).from(document).where(mine(c.var.userId, c.var.orgId, c.req.param("id")));
    if (!doc) return c.json({ error: "not found" }, 404);
    const { key, ...rest } = doc;
    return c.json({ document: rest, url: await files.getUrl(key, doc.name) });
  });

  r.delete("/documents/:id", doc({ tags: ["documents"], summary: "Delete a document (stored file, then row)", responses: { 200: { description: "`{ success: true }`" }, 404: errors[404] } }), async (c) =>
    (await removeDocuments(db, files, mine(c.var.userId, c.var.orgId, c.req.param("id")))) ? c.json({ success: true }) : c.json({ error: "not found" }, 404));

  // Dev stand-in for the presigned S3 URLs: only the session's own `<org>/<user>/<id>` keys, only for a document row that exists.
  const { dir } = files;
  if (dir) {
    const own = async (v: Env["Variables"], p: { org: string; user: string; id: string }) =>
      p.org === v.orgId && p.user === v.userId
        ? (await db.select({ key: document.key, contentType: document.contentType, size: document.size }).from(document).where(mine(v.userId, v.orgId, p.id)))[0]
        : undefined;
    const devDoc = { tags: ["documents"], description: "Dev and tests only (not mounted in production, where the URLs are presigned S3 URLs). Only the session's own keys." };
    r.put("/dev-files/:org/:user/:id", doc({ ...devDoc, summary: "Dev stand-in for the S3 upload URL", responses: { 200: { description: "Stored" }, 403: { description: "Size or content type differs from the document" }, 404: errors[404], 413: errors[413] } }), bodyLimit({ maxSize: MAX_SIZE, onError: (c) => c.json({ error: "too large" }, 413) }), async (c) => {
      const doc = await own(c.var, c.req.param());
      if (!doc) return c.json({ error: "not found" }, 404);
      const bytes = new Uint8Array(await c.req.arrayBuffer());
      if (bytes.length !== doc.size || c.req.header("content-type") !== doc.contentType) return c.json({ error: "does not match the presigned size and type" }, 403);
      await mkdir(dirname(join(dir, doc.key)), { recursive: true });
      await writeFile(join(dir, doc.key), bytes);
      return c.body(null, 200);
    });
    r.get("/dev-files/:org/:user/:id", doc({ ...devDoc, summary: "Dev stand-in for the S3 read URL", responses: { 200: { description: "The file bytes" }, 404: errors[404] } }), async (c) => {
      const doc = await own(c.var, c.req.param());
      const bytes = doc && (await readFile(join(dir, doc.key)).catch(() => null));
      if (!doc || !bytes) return c.json({ error: "not found" }, 404);
      return c.body(bytes, 200, { "content-type": doc.contentType });
    });
  }

  return r;
};
