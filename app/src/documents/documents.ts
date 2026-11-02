import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient, send } from '../auth/planSync.ts'
import { toast } from '../state/shell.ts'

const UPLOAD_FAILED = "That file couldn't be uploaded. Try again, or type the figures instead."

/** Creates the document, then PUTs the bytes to the presigned URL the API returns. */
export async function uploadDocument(file: File) {
  // The file inputs only accept pdf/jpeg/png/heic; browsers leave HEIC's type empty.
  const contentType = file.type || 'image/heic'
  const created = await send('POST', '/api/documents', {
    name: file.name,
    contentType,
    size: file.size,
  })
  if (!created.ok) throw new Error(`document ${created.status}`)
  const { upload }: { upload: { url: string; method: string; headers: Record<string, string> } } =
    await created.json()
  const stored = await fetch(upload.url, {
    method: upload.method,
    headers: upload.headers,
    body: file,
  })
  if (!stored.ok) throw new Error(`upload ${stored.status}`)
}

/**
 * Real uploads, when the tenant's documentUpload flag is on (off until GET /api/tenant answers).
 * `upload` sends the chosen files, then hands their names on to the (mock) reader.
 */
export function useDocumentUpload() {
  const { data: on = false } = useQuery(
    {
      queryKey: ['tenant'],
      queryFn: async () => (await send('GET', '/api/tenant')).json(),
      staleTime: Infinity,
      select: (tenant: { features: { documentUpload: boolean } }) => tenant.features.documentUpload,
    },
    queryClient,
  )
  const { mutate, isPending } = useMutation(
    { mutationFn: (files: File[]) => Promise.all(files.map(uploadDocument)) },
    queryClient,
  )
  const upload = (input: HTMLInputElement, then: (names: string[]) => void) => {
    const files = [...(input.files ?? [])]
    input.value = '' // the same file can be picked again after a failure
    if (!files.length) return
    mutate(files, {
      onSuccess: () => then(files.map(({ name }) => name)),
      onError: () => toast(UPLOAD_FAILED),
    })
  }
  return { on, pending: isPending, upload }
}
