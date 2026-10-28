// tools/view-equal.mjs against two fakes: identical views pass, an altered one exits 1 with a diff.
// Launches Chrome (playwright-core).
import { createServer, type Server } from 'node:http'
import { readFileSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { testHookOn } from '../../src/lib/lmTestHook.ts'
import { diffObj } from '../../tools/normalise.mjs'

const appRoot = resolve(__dirname, '../..')
const fakesDir = resolve(__dirname, 'fake')
let server: Server
let baseUrl = ''

beforeAll(async () => {
  server = createServer((request, response) => {
    const file = request.url!.slice(1).split('?')[0]
    if (!file.endsWith('.html')) {
      response.writeHead(404).end() // favicon
      return
    }
    response.setHeader('content-type', 'text/html')
    response.end(readFileSync(resolve(fakesDir, file)))
  })
  await new Promise<void>((listening) => server.listen(0, '127.0.0.1', listening))
  const { port } = server.address() as { port: number }
  baseUrl = `http://127.0.0.1:${port}/`
})
afterAll(() => server.close())

// Async on purpose: a sync spawn would block the fake server in this process.
function viewEqual(appPage: string) {
  const args = ['tools/view-equal.mjs', 'D1', 'tests/scenarios/fake.json', '--fixtures=fresh']
  const env = { ...process.env, PROTO: baseUrl + 'proto.html', APP: baseUrl + appPage }
  return new Promise<{ status: number; stdout: string }>((done) =>
    execFile('node', args, { cwd: appRoot, env }, (error, stdout) =>
      done({ status: error ? Number(error.code) : 0, stdout }),
    ),
  )
}

describe('view-equal', () => {
  it('passes identical fakes (style, class order, split text, live input value)', async () => {
    const { status, stdout } = await viewEqual('app.html')
    expect(stdout).toContain('2 runs, 0 failing')
    expect(status).toBe(0)
  }, 90_000)

  it('exits 1 with a diff when the app view differs', async () => {
    const { status, stdout } = await viewEqual('app.html?alt')
    expect(status).toBe(1)
    expect(stdout).toMatch(/^- +"Why: "$[\s\S]*^\+ +"Wy: "$/m)
  }, 90_000)

  it('reports the state paths that differ, ignoring key order', () => {
    expect(diffObj({ a: 1, b: { c: [1, 2] } }, { b: { c: [1, 3] }, a: 1 })).toEqual([
      'S.b.c[1]: proto 2 | app 3',
    ])
  })

  it('exposes the hook only on a local host with lm-test-auth', () => {
    expect(testHookOn('localhost', '1')).toBe(true)
    expect(testHookOn('127.0.0.1', '1')).toBe(true)
    expect(testHookOn('localhost', null)).toBe(false)
    expect(testHookOn('lifemap.ie', '1')).toBe(false)
  })
})
