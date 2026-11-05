import type { Env } from './types'

export async function requireAdmin(req: Request, env: Env, adminRequired = true): Promise<Response | null> {
  const token = req.headers.get('Authorization')?.replace(/^Bearer /, '') || req.headers.get('X-Admin-Token')
  if (!token) return Response.json({ error: 'Authentication required' }, { status: 401 })
  const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` }
  try {
    const result = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers, signal: AbortSignal.timeout(8000) })
    if (!result.ok) return Response.json({ error: 'Invalid authentication' }, { status: result.status >= 500 ? 503 : 401 })
    const user = await result.json() as { id?: string; email_confirmed_at?: string; is_anonymous?: boolean }
    if (!user.id || !user.email_confirmed_at || user.is_anonymous) return Response.json({ error: 'Confirmed account required' }, { status: 403 })
    if (!adminRequired) return null
    // The verified user token, not the service role, authorizes this RPC.
    const admin = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/is_directory_admin`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(8000),
    })
    if (!admin.ok) return Response.json({ error: 'Authorization unavailable' }, { status: 503 })
    if (await admin.json() !== true) return Response.json({ error: 'Admin required' }, { status: 403 })
    return null
  } catch { return Response.json({ error: 'Authorization unavailable' }, { status: 503 }) }
}

export async function readJsonBody(req: Request): Promise<unknown> {
  if (!req.headers.get('Content-Type')?.startsWith('application/json') || !req.body) throw new Error('JSON required')
  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > 128000) { await reader.cancel(); throw new Error('Body too large') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes))
}
