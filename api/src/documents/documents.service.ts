import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { DB, type Db } from "../db";
import { document } from "../db/schema";
import { FILES, type Files, removeDocuments } from "../files";
import { logger } from "../observe";
import { DOCUMENT_READER, type DocumentReader, type ReadResult } from "./reader";

const fields = { id: document.id, name: document.name, contentType: document.contentType, size: document.size, createdAt: document.createdAt };
const readFields = { readStatus: document.readStatus, readFields: document.readFields, readProvider: document.readProvider, readAt: document.readAt };
const mine = (userId: string, orgId: string, id?: string) =>
  and(eq(document.userId, userId), eq(document.organizationId, orgId), id === undefined ? undefined : eq(document.id, id));

/** Statements and documents, the caller's in the session's tenant. Objects are keyed `<org>/<user>/<id>`; the key never comes from the client. */
@Injectable()
export class DocumentsService {
  constructor(@Inject(DB) private readonly db: Db, @Inject(FILES) private readonly files: Files, @Inject(DOCUMENT_READER) private readonly reader: DocumentReader) {}

  /** The new document and the URL to PUT its bytes to. */
  async create(userId: string, orgId: string, { name, contentType, size }: { name: string; contentType: string; size: number }) {
    const id = randomUUID();
    const key = `${orgId}/${userId}/${id}`;
    const [doc] = await this.db.insert(document).values({ id, userId, organizationId: orgId, key, name, contentType, size }).returning(fields);
    return { document: doc, upload: { url: await this.files.putUrl(key, contentType, size), method: "PUT", headers: { "content-type": contentType } } };
  }

  list = (userId: string, orgId: string) => this.db.select(fields).from(document).where(mine(userId, orgId)).orderBy(desc(document.createdAt));

  /** The document and a read URL; undefined when not the caller's. */
  async get(userId: string, orgId: string, id: string) {
    const [doc] = await this.db.select({ ...fields, ...readFields, key: document.key }).from(document).where(mine(userId, orgId, id));
    if (!doc) return undefined;
    const { key, ...rest } = doc;
    return { document: rest, url: await this.files.getUrl(key, doc.name) };
  }

  /** Sends a read URL to the document reader and stores what it found (a reader error is stored as `failed`); undefined when not the caller's. */
  async read(userId: string, orgId: string, id: string, kind: string, requestId?: string) {
    const where = mine(userId, orgId, id);
    const [found] = await this.db.select({ id: document.id, key: document.key, name: document.name, contentType: document.contentType }).from(document).where(where);
    if (!found) return undefined;
    let result: ReadResult;
    try {
      result = await this.reader.read({ documentId: found.id, kind, contentType: found.contentType, url: await this.files.getUrl(found.key, found.name), organizationId: orgId });
    } catch (e) {
      // Timeout, provider down, bad reply or no reader configured: the customer types the figures instead.
      logger.error("document read failed", { requestId, documentId: found.id, error: e instanceof z.ZodError ? "invalid provider reply" : String(e) }); // never the reply itself: it holds the customer's figures
      result = { status: "failed", fields: [], provider: "none" };
    }
    const [saved] = await this.db.update(document)
      .set({ readStatus: result.status, readFields: result.fields, readProvider: result.provider, readAt: new Date() })
      .where(where)
      .returning({ ...fields, ...readFields });
    return saved;
  }

  /** Deletes the stored file, then the row; the count deleted (0 when not the caller's). */
  remove = (userId: string, orgId: string, id: string) => removeDocuments(this.db, this.files, mine(userId, orgId, id));

  /** Dev stand-in for presigned URLs: the session's own document row for `<org>/<user>/<id>`. */
  async own(userId: string, orgId: string, p: { org: string; user: string; id: string }) {
    if (p.org !== orgId || p.user !== userId) return undefined;
    return (await this.db.select({ key: document.key, contentType: document.contentType, size: document.size }).from(document).where(mine(userId, orgId, p.id)))[0];
  }
}
