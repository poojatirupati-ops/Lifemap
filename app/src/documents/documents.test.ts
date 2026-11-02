import { expect, test, vi } from 'vitest'
import { uploadDocument } from './documents.ts'

test('creates the document, then PUTs the bytes to the presigned URL', async () => {
  const upload = {
    url: 'https://bucket.example/key?sig',
    method: 'PUT',
    headers: { 'content-type': 'application/pdf' },
  }
  const fetch = vi.fn(async (url: string, _init?: RequestInit) =>
    url === '/api/documents'
      ? new Response(JSON.stringify({ document: { id: 'd1' }, upload }), { status: 201 })
      : new Response(null, { status: 200 }),
  )
  vi.stubGlobal('fetch', fetch)
  const file = new File(['%PDF'], 'Pension.pdf', { type: 'application/pdf' })

  await uploadDocument(file)

  expect(JSON.parse(fetch.mock.calls[0][1]!.body as string)).toEqual({
    name: 'Pension.pdf',
    contentType: 'application/pdf',
    size: 4,
  })
  expect(fetch.mock.calls[1]).toEqual([
    upload.url,
    { method: 'PUT', headers: upload.headers, body: file },
  ])
})
