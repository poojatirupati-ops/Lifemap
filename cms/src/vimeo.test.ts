// node --experimental-test-module-mocks --import tsx --test src/vimeo.test.ts  (npm test)
import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const calls: { method?: string; path: string; query?: any }[] = []
mock.module('@vimeo/vimeo', {
  namedExports: {
    Vimeo: class {
      async request(options: (typeof calls)[number]) {
        calls.push(options)
        const body =
          options.path === '/me/videos' ? { uri: '/videos/123', upload: { upload_link: 'https://tus.vimeo.com/abc' } } : {}
        return { statusCode: 200, body }
      }
    },
  },
})

test('the tus ticket: Vimeo video sized for the file, hidden, embed only on the app domains', async () => {
  Object.assign(process.env, { VIMEO_ACCESS_TOKEN: 't', CMS_CORS_ORIGINS: 'https://app.lifemap.ie' })
  const { createVimeoUpload, statusOf } = await import('./vimeo')

  assert.deepEqual(await createVimeoUpload({ name: 'Borrowing.mp4', size: 52_428_800 }), {
    vimeoId: '123',
    uploadLink: 'https://tus.vimeo.com/abc',
  })
  const [create, domain] = calls
  assert.deepEqual(create.query.upload, { approach: 'tus', size: 52_428_800 })
  assert.deepEqual(create.query.privacy, { view: 'disable', embed: 'whitelist' })
  assert.equal(domain.method, 'PUT')
  assert.equal(domain.path, '/videos/123/privacy/domains/app.lifemap.ie')

  assert.equal(statusOf({ upload: { status: 'in_progress' } }), 'uploading')
  assert.equal(statusOf({ upload: { status: 'complete' }, transcode: { status: 'in_progress' } }), 'transcoding')
  assert.equal(statusOf({ upload: { status: 'complete' }, transcode: { status: 'complete' } }), 'ready')
  assert.equal(statusOf({ upload: { status: 'complete' }, transcode: { status: 'error' } }), 'failed')
})
