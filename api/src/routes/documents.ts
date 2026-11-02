import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { INestApplicationContext } from "@nestjs/common";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { validator } from "hono-openapi";
import { z } from "zod";
import { document } from "../db/schema";
import { DocumentsService } from "../documents/documents.service";
import { FILES, type Files } from "../files";
import { type Env, requireFeature } from "../guard";
import { doc, errors } from "../openapi";

const MAX_SIZE = 10 * 1024 * 1024;
const newDocument = createInsertSchema(document, {
  name: (s) => s.trim().min(1).max(200),
  contentType: z.enum(["application/pdf", "image/jpeg", "image/png", "image/heic", "text/csv"]),
  size: (s) => s.min(1).max(MAX_SIZE),
}).pick({ name: true, contentType: true, size: true });
const readRequest = z.object({ kind: z.string().regex(/^[a-zA-Z0-9]{1,40}$/) });

/**
 * Statements and documents, the caller's in the session's tenant (DocumentsService).
 * POST is gated by the tenant's documentUpload flag; list, read and delete always work so people can reach and erase what they have.
 */
export const documentRoutes = (nest: INestApplicationContext) => {
  const r = new Hono<Env>();
  const docs = nest.get(DocumentsService);

  r.post("/documents", doc({
    tags: ["documents"], flag: "documentUpload", summary: "Create a document and get its upload URL",
    description: "PUT the file bytes to `upload.url` with `upload.headers` within 5 minutes. Max 10 MB.",
    responses: { 201: { description: "`{ document, upload: { url, method: \"PUT\", headers } }`" }, 400: errors[400] },
  }), requireFeature("documentUpload"), validator("json", newDocument, (res, c) => (res.success ? undefined : c.json({ error: "invalid document" }, 400))), async (c) =>
    c.json(await docs.create(c.var.userId, c.var.orgId, c.req.valid("json")), 201));

  r.get("/documents", doc({ tags: ["documents"], summary: "The caller's documents", responses: { 200: { description: "`{ documents: [{ id, name, contentType, size, createdAt }] }`, newest first" } } }), async (c) =>
    c.json({ documents: await docs.list(c.var.userId, c.var.orgId) }));

  r.get("/documents/:id", doc({ tags: ["documents"], summary: "A document and a 5-minute read URL", responses: { 200: { description: "`{ document, url }`" }, 404: errors[404] } }), async (c) => {
    const found = await docs.get(c.var.userId, c.var.orgId, c.req.param("id"));
    return found ? c.json(found) : c.json({ error: "not found" }, 404);
  });

  r.post("/documents/:id/read", doc({
    tags: ["documents"], flag: "documentUpload", summary: "Read the figures in a document",
    description: "Sends a 5-minute read URL to the document reader (DOC_READER) and stores what it found. `kind`: income, assets, liab, prot, pension, retire, home or invest. A reader error is stored as `failed`.",
    responses: { 200: { description: "`{ document }` with `readStatus`, `readFields: [{ key, value, confidence 0..1 }]`, `readProvider`, `readAt`" }, 400: errors[400], 404: errors[404] },
  }), requireFeature("documentUpload"), validator("json", readRequest, (res, c) => (res.success ? undefined : c.json({ error: "invalid kind" }, 400))), async (c) => {
    const saved = await docs.read(c.var.userId, c.var.orgId, c.req.param("id"), c.req.valid("json").kind, c.get("requestId"));
    return saved ? c.json({ document: saved }) : c.json({ error: "not found" }, 404);
  });

  r.delete("/documents/:id", doc({ tags: ["documents"], summary: "Delete a document (stored file, then row)", responses: { 200: { description: "`{ success: true }`" }, 404: errors[404] } }), async (c) =>
    (await docs.remove(c.var.userId, c.var.orgId, c.req.param("id"))) ? c.json({ success: true }) : c.json({ error: "not found" }, 404));

  // Dev stand-in for the presigned S3 URLs: only the session's own `<org>/<user>/<id>` keys, only for a document row that exists.
  const { dir } = nest.get<Files>(FILES);
  if (dir) {
    const devDoc = { tags: ["documents"], description: "Dev and tests only (not mounted in production, where the URLs are presigned S3 URLs). Only the session's own keys." };
    r.put("/dev-files/:org/:user/:id", doc({ ...devDoc, summary: "Dev stand-in for the S3 upload URL", responses: { 200: { description: "Stored" }, 403: { description: "Size or content type differs from the document" }, 404: errors[404], 413: errors[413] } }), bodyLimit({ maxSize: MAX_SIZE, onError: (c) => c.json({ error: "too large" }, 413) }), async (c) => {
      const doc = await docs.own(c.var.userId, c.var.orgId, c.req.param());
      if (!doc) return c.json({ error: "not found" }, 404);
      const bytes = new Uint8Array(await c.req.arrayBuffer());
      if (bytes.length !== doc.size || c.req.header("content-type") !== doc.contentType) return c.json({ error: "does not match the presigned size and type" }, 403);
      await mkdir(dirname(join(dir, doc.key)), { recursive: true });
      await writeFile(join(dir, doc.key), bytes);
      return c.body(null, 200);
    });
    r.get("/dev-files/:org/:user/:id", doc({ ...devDoc, summary: "Dev stand-in for the S3 read URL", responses: { 200: { description: "The file bytes" }, 404: errors[404] } }), async (c) => {
      const doc = await docs.own(c.var.userId, c.var.orgId, c.req.param());
      const bytes = doc && (await readFile(join(dir, doc.key)).catch(() => null));
      if (!doc || !bytes) return c.json({ error: "not found" }, 404);
      return c.body(bytes, 200, { "content-type": doc.contentType });
    });
  }

  return r;
};
