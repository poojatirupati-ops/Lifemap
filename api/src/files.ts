import { rm } from "node:fs/promises";
import { join } from "node:path";
import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { SQL } from "drizzle-orm";
import type { Db } from "./db";
import { document } from "./db/schema";

/** Where uploaded documents live. Production: the private S3 bucket. Dev and tests: a local folder served by routes/documents.ts. */
export type Files = {
  /** URL the browser PUTs the file to, with exactly this Content-Type and size; valid 5 minutes. */
  putUrl(key: string, contentType: string, size: number): Promise<string>;
  /** Short-lived URL to read the file. */
  getUrl(key: string, name: string): Promise<string>;
  remove(keys: string[]): Promise<void>;
  /** Dev only: the local folder the files are kept in. */
  dir?: string;
};

/** Nest token for the Files store (FilesModule). */
export const FILES = "Files";

const TTL = 300; // seconds

// Presigning is local (no network): the URL carries the Lambda role's signature, and S3 checks key, content type and length against it.
export const s3Files = (s3: S3Client, Bucket: string): Files => ({
  putUrl: (Key, ContentType, ContentLength) => getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType, ContentLength }), { expiresIn: TTL, signableHeaders: new Set(["content-type", "content-length"]) }),
  getUrl: (Key, name) => getSignedUrl(s3, new GetObjectCommand({ Bucket, Key, ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(name)}` }), { expiresIn: TTL }),
  remove: async (keys) => {
    for (let i = 0; i < keys.length; i += 1000) { // DeleteObjects takes up to 1000 keys
      const res = await s3.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true } }));
      if (res.Errors?.length) throw new Error(`S3 delete failed for ${res.Errors.length} object(s)`); // never report erasure done when it is not
    }
  },
});

/** Dev and tests: files under `dir`, uploaded and read through /api/dev-files (same session scoping as S3 keys). */
export const devFiles = (dir: string): Files => ({
  dir,
  putUrl: async (key) => `/api/dev-files/${key}`,
  getUrl: async (key) => `/api/dev-files/${key}`,
  remove: async (keys) => void (await Promise.all(keys.map((k) => rm(join(dir, k), { force: true })))),
});

/** Deletes the stored objects, then the rows, for the documents matching `where`. Objects first, so a failure leaves the rows to retry from. */
export const removeDocuments = async (db: Db, files: Files, where: SQL | undefined) => {
  const rows = await db.select({ key: document.key }).from(document).where(where);
  if (!rows.length) return 0;
  await files.remove(rows.map((r) => r.key));
  await db.delete(document).where(where);
  return rows.length;
};
