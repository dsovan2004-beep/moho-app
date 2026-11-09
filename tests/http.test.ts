import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readRequest, validateRequest } from '../lib/directory-requests'
import { safeReturnTo } from '../lib/auth-return'
import { savedSubmissionReference } from '../lib/submission-receipt'
import worker from '../workers/ingestion-worker'
import { POST as createRequest } from '../app/api/business-requests/route'
import { POST as oldClaim } from '../app/api/notify/claim/route'
import { POST as oldSubmit } from '../app/api/notify/submit/route'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only-not-a-real-key', APP_ENV: 'production' }
const body = { kind: 'submission', requestKey: '00000000-0000-4000-8000-000000000020', payload: {
  name: 'Fixture Business', category: 'Home Services', city: 'Mountain House', description: 'Fixture repair business', website: 'https://example.test',
} }
const request = (payload: unknown = body, origin = 'https://www.moholocal.com') => new Request('https://www.moholocal.com/api/business-requests', {
  method: 'POST', headers: { origin, 'Content-Type': 'application/json', Authorization: 'Bearer test-user-session-token' }, body: JSON.stringify(payload),
})
function authMock(isAdmin: unknown, status = 200) {
  const calls: string[] = []
  globalThis.fetch = async (url) => {
    const path = String(url); calls.push(path)
    if (path.endsWith('/auth/v1/user')) return Response.json({ id: 'user', email_confirmed_at: '2026-01-01' }, { status })
    if (path.endsWith('/rpc/is_directory_admin')) return Response.json(isAdmin)
    throw new Error(`Unexpected mutation or external call: ${path}`)
  }
  return calls
}

test('Worker health stays public, manual runs require POST and auth before any job starts', async () => {
  globalThis.fetch = async () => { throw new Error('No network allowed') }
  assert.equal((await worker.fetch(new Request('https://worker.test/health'), env)).status, 200)
  for (const path of ['/run/all', '/run/directory', '/run/events', '/run/lostfound', '/validate', '/submit-signal', '/promote-submission']) {
    assert.equal((await worker.fetch(new Request(`https://worker.test${path}`), env)).status, 405)
    assert.equal((await worker.fetch(new Request(`https://worker.test${path}`, { method: 'POST' }), env)).status, 401)
  }
})

test('Worker rejects invalid tokens, confirmed non-admins and authorization outages', async () => {
  for (const [admin, authStatus, expected] of [[true, 401, 401], [false, 200, 403], ['true', 200, 403], [true, 503, 503]] as const) {
    const calls = authMock(admin, authStatus)
    const result = await worker.fetch(new Request('https://worker.test/promote-submission', {
      method: 'POST', headers: { 'X-Admin-Token': 'test-token' },
    }), env)
    assert.equal(result.status, expected)
    assert.ok(calls.every(url => /\/auth\/v1\/user$|\/rpc\/is_directory_admin$/.test(url)))
  }
  globalThis.fetch = async () => { throw new Error('Auth offline') }
  assert.equal((await worker.fetch(new Request('https://worker.test/run/all', { method: 'POST', headers: { Authorization: 'Bearer test' } }), env)).status, 503)
})

test('a valid Worker admin reaches validation, never performs an incomplete mutation', async () => {
  const calls = authMock(true)
  const result = await worker.fetch(new Request('https://worker.test/promote-submission', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer valid-test-token' }, body: '{}',
  }), env)
  assert.equal(result.status, 400)
  assert.equal(calls.length, 2)
})

test('confirmed resident signals use the rate-limited RPC rather than a privileged direct insert', async () => {
  const calls: string[] = []
  globalThis.fetch = async (url, init) => {
    calls.push(String(url))
    if (String(url).endsWith('/auth/v1/user')) return Response.json({ id: 'resident', email_confirmed_at: '2026-01-01' })
    assert.ok(String(url).endsWith('/rpc/create_community_signal'))
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer resident-session')
    return Response.json('00000000-0000-4000-8000-000000000099')
  }
  const result = await worker.fetch(new Request('https://worker.test/submit-signal', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer resident-session' },
    body: JSON.stringify({ title: 'Fixture event', description: 'Fixture local event', city: 'Tracy', submission_type: 'event' }),
  }), env)
  assert.equal(result.status, 201)
  assert.equal(savedSubmissionReference(await result.json()), '00000000-0000-4000-8000-000000000099')
  assert.equal(calls.length, 2)
})

test('form validation rejects forged flags, unsafe URLs, invalid cities and missing useful contact', () => {
  assert.equal(validateRequest(body).payload.city, 'Mountain House')
  for (const fields of [{ verified: 'true' }, { website: 'javascript:alert(1)' }, { website: 'https://user:pass@example.test' },
    { city: 'Sacramento' }, { website: '', phone: '' }, { name: '' }, { contact_email: 'victim@example.test' }]) {
    assert.throws(() => validateRequest({ ...body, payload: { ...body.payload, ...fields } }))
  }
  assert.throws(() => validateRequest({ ...body, payload: [] }))
  assert.throws(() => validateRequest({ ...body, requestKey: 'bad-id' }))
})

test('cross-origin, oversized streamed bodies and malformed JSON are rejected', async () => {
  await assert.rejects(() => readRequest(request(body, 'https://attacker.test')), /MoHoLocal form/)
  await assert.rejects(() => readRequest(request({ text: 'x'.repeat(17000) })), /too large/)
  const broken = new Request('https://www.moholocal.com/api/business-requests', {
    method: 'POST', headers: { origin: 'https://www.moholocal.com', 'Content-Type': 'application/json' }, body: '{',
  })
  await assert.rejects(() => readRequest(broken), /Invalid JSON/)
  assert.deepEqual(await readRequest(request()), body)
})

test('submission API requires a validated confirmed user and a saved RPC receipt', async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = env.SUPABASE_URL
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-only-publishable-key'
  const calls: string[] = []
  globalThis.fetch = async (url, init) => {
    const path = String(url); calls.push(path)
    if (path.endsWith('/auth/v1/user')) return Response.json({ id: '00000000-0000-4000-8000-000000000002', email: 'alice@example.test', email_confirmed_at: '2026-01-01', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01' })
    if (path.endsWith('/rpc/create_business_request')) {
      assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer test-user-session-token')
      const sent = JSON.parse(String(init?.body)); assert.equal(sent.p_payload.verified, undefined)
      return Response.json('00000000-0000-4000-8000-000000000099')
    }
    if (path.includes('/business_requests')) return Response.json({ id: '00000000-0000-4000-8000-000000000099', status: 'pending' })
    throw new Error(`Unexpected endpoint ${path}`)
  }
  const response = await createRequest(request())
  assert.equal(response.status, 201)
  assert.equal((await response.json()).status, 'pending')
  assert.ok(calls.some(url => url.endsWith('/auth/v1/user')))
})

test('API returns no success receipt on invalid auth or failed persistence; old email hooks are gone', async () => {
  globalThis.fetch = async () => Response.json({ error: 'invalid token' }, { status: 401 })
  assert.equal((await createRequest(request())).status, 401)
  globalThis.fetch = async (url) => String(url).endsWith('/auth/v1/user')
    ? Response.json({ id: 'user', email_confirmed_at: '2026-01-01', app_metadata: {}, user_metadata: {} })
    : Response.json({ code: 'P0001', message: 'rate limit' }, { status: 400 })
  assert.equal((await createRequest(request())).status, 429)
  assert.equal(oldClaim().status, 410); assert.equal(oldSubmit().status, 410)
})

test('login return paths cannot redirect to external or arbitrary locations', () => {
  for (const path of ['https://attacker.test', '//attacker.test', '/\\attacker.test', '/admin', '/%2f%2fattacker.test']) assert.equal(safeReturnTo(path), '/')
  assert.equal(safeReturnTo('/submit-business'), '/submit-business')
})

test('reaction HTTP writes reject anonymous, spoofed identity, cross-origin and quota failures', async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = env.SUPABASE_URL
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-only-publishable-key'
  const { POST, GET } = await import('../app/api/reactions/route')
  const payload = { post_id: '00000000-0000-4000-8000-000000000099', reaction_type: 'helpful' }
  assert.equal((await POST(new Request('https://www.moholocal.com/api/reactions', { method: 'POST' }))).status, 401)
  let rpcCalls = 0
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith('/auth/v1/user')) return Response.json({ id: 'account', email_confirmed_at: '2026-01-01', app_metadata: {}, user_metadata: {} })
    rpcCalls++
    const data = JSON.parse(String(init?.body))
    assert.deepEqual(Object.keys(data).sort(), ['p_post_id', 'p_type'])
    return Response.json({ code: 'P0001' }, { status: 400 })
  }
  assert.equal((await POST(request({ ...payload, user_id: 'someone-else' }))).status, 400)
  assert.equal((await POST(request(payload, 'https://attacker.test'))).status, 403)
  assert.equal(rpcCalls, 0)
  assert.equal((await POST(request(payload))).status, 429)
  assert.equal(rpcCalls, 1)
  assert.equal((await GET(new Request('https://www.moholocal.com/api/reactions?post_id=bad'))).status, 400)
})

test('tracked source files contain no embedded JWT credentials', () => {
  const { execFileSync } = require('node:child_process')
  const { readFileSync } = require('node:fs')
  const paths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
  const tokenPattern = new RegExp('ey' + 'J[A-Za-z0-9_-]{15,}')
  for (const path of paths) {
    let content: string
    try { content = readFileSync(path, 'utf8') } catch { continue }
    assert.equal(tokenPattern.test(content), false, `Embedded credential in ${path}`)
    assert.equal(new RegExp('sb_'+'secret_[A-Za-z0-9_-]{35,}').test(content),false,`Embedded modern credential in ${path}`)
  }
})

test('Worker supports independently rotatable secret keys without putting them into a user JWT header', async () => {
  const { selectRows, insertRow } = await import('../workers/lib/supabase')
  for (const key of ['sb_secret_test-only-not-real', 'legacy-test-only-not-real']) {
    let calls = 0
    globalThis.fetch = async (_url, init) => {
      calls++
      const h = new Headers(init?.headers)
      assert.equal(h.get('apikey'), key)
      assert.equal(h.get('authorization'), key.startsWith('sb_secret_') ? null : `Bearer ${key}`)
      return Response.json([{ id: 'fixture' }])
    }
    const testEnv = { ...env, SUPABASE_SERVICE_ROLE_KEY: key }
    await selectRows(testEnv, 'businesses', { id: 'fixture' })
    assert.equal((await insertRow(testEnv, 'community_submissions', { title: 'Fixture' })).ok, true)
    assert.equal(calls, 2)
  }
})

test('report and pet login return paths preserve only the bounded intake query fields', () => {
  assert.equal(safeReturnTo('/submit?submission_type=lost_pet'),'/submit?submission_type=lost_pet')
  assert.equal(safeReturnTo('/submit?next=https://attacker.test'),'/')
  assert.equal(safeReturnTo('/submit?title='+'x'.repeat(1501)),'/')
})

test('structured listing data cannot terminate its HTML script container', async () => {
 const { serializeJsonLd }=await import('../lib/json-ld')
 const payload={name:'</script><script>alert("fixture")</script>',description:'Neighborhood \u2028 report \u2029'}
 const rendered=serializeJsonLd(payload)
 assert.equal(rendered.includes('<'),false)
 assert.deepEqual(JSON.parse(rendered),payload)
})


test('outcome sign-in returns only to a known city and exact optional form',()=>{
  for(const city of ['Mountain House','Tracy','Lathrop','Manteca','All Cities']) {
    const target=`/directory?${new URLSearchParams({city})}#resident-outcome`
    assert.equal(safeReturnTo(target),target)
  }
  assert.equal(safeReturnTo('/directory'),'/directory')
  for(const target of ['/directory?city=San+Jose#resident-outcome','/directory?city=Lathrop&city=Manteca#resident-outcome','/directory?city=Manteca&next=https://evil.test#resident-outcome','/directory?city=Lathrop#admin','/directory?city=Lathrop%0d%0aLocation:https://evil.test#resident-outcome']) assert.equal(safeReturnTo(target),'/')
})
