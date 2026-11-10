import { useMutation } from '@tanstack/react-query'
import { queryClient, send } from '../auth/planSync.ts'
import { z } from 'zod'
import type { DocumentRead } from '../domain/finances/upload.ts'
import { toast } from '../state/shell.ts'
import { useTenant } from '../shell/tenant.ts'
import { track } from '../analytics/analytics.ts'

const UPLOAD_FAILED = "That file couldn't be uploaded. Try again, or type the figures instead."

interface CreatedDocument {
  document: { id: string }
  upload: { url: string; method: string; headers: Record<string, string> }
}

/** Creates the document, then PUTs the bytes to the presigned URL the API returns; resolves to the document id. */
export async function uploadDocument(file: File) {
  // The file inputs only accept pdf/jpeg/png/heic; browsers leave HEIC's type empty.
  const contentType = file.type || 'image/heic'
  const created = await send('POST', '/api/documents', {
    name: file.name,
    contentType,
    size: file.size,
  })
  if (!created.ok) throw new Error(`document ${created.status}`)
  const { document, upload }: CreatedDocument = await created.json()
  const stored = await fetch(upload.url, {
    method: upload.method,
    headers: upload.headers,
    body: file,
  })
  if (!stored.ok) throw new Error(`upload ${stored.status}`)
  track('document_uploaded', { type: contentType })
  return document.id
}

const readReply = z.object({
  document: z.object({
    readStatus: z.enum(['done', 'failed']),
    readProvider: z.string(),
    readFields: z.array(
      z.object({
        key: z.string(),
        value: z.union([z.number(), z.string()]),
        confidence: z.number(),
      }),
    ),
  }),
})

/** Has the API's document reader read each document as `kind`; one figure per key, the surest wins. */
export async function readDocuments(ids: string[], kind: string): Promise<DocumentRead> {
  const reads = await Promise.all(
    ids.map(async (id) => {
      const response = await send('POST', `/api/documents/${id}/read`, { kind })
      if (!response.ok) throw new Error(`read ${response.status}`)
      return readReply.parse(await response.json()).document
    }),
  )
  const fields: DocumentRead['fields'] = {}
  for (const { readFields } of reads) {
    for (const { key, value, confidence } of readFields) {
      const percent = Math.round(confidence * 100)
      if (!fields[key] || fields[key].confidence < percent)
        fields[key] = { value, confidence: percent }
    }
  }
  return {
    provider: reads.find((read) => read.readProvider !== 'example')?.readProvider ?? 'example',
    failed: reads.every((read) => read.readStatus === 'failed'),
    fields,
  }
}

/**
 * Real uploads, when the tenant's documentUpload flag is on (off until GET /api/tenant answers,
 * unlike useFeature, so no file picker shows for a tenant that turned uploads off).
 * `upload` sends the chosen files, has the API read them as `kind`, then hands on their names and what was read.
 */
export function useDocumentUpload(kind: string) {
  const on = useTenant()?.features.documentUpload === true
  const { mutate, isPending } = useMutation(
    {
      mutationFn: async (files: File[]) =>
        readDocuments(await Promise.all(files.map(uploadDocument)), kind),
    },
    queryClient,
  )
  const upload = (input: HTMLInputElement, then: (names: string[], read: DocumentRead) => void) => {
    const files = [...(input.files ?? [])]
    input.value = '' // the same file can be picked again after a failure
    if (!files.length) return
    mutate(files, {
      onSuccess: (read) =>
        then(
          files.map(({ name }) => name),
          read,
        ),
      onError: () => toast(UPLOAD_FAILED),
    })
  }
  return { on, pending: isPending, upload }
}
