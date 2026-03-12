// ── Supabase REST write layer ─────────────────────────────────────────────────
// Uses fetch against Supabase's PostgREST API directly — no JS SDK needed.
// Service role key is required for writes and bypass RLS.
//
// All writes are upserts (POST with Prefer: resolution=merge-duplicates)
// using unique columns defined per table.

import type { Env, SupabaseRow } from './types'

function headers(env: Env, extra?: Record<string, string>): HeadersInit {
  return {
    apikey:          env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization:   `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type':  'application/json',
    Prefer:          'return=representation,resolution=merge-duplicates',
    ...extra,
  }
}

// ── Generic select (for deduplication checks) ─────────────────────────────────
export async function selectRows<T extends SupabaseRow>(
  env: Env,
  table: string,
  filters: Record<string, string>,
): Promise<T[]> {
  const params = Object.entries(filters)
    .map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`)
    .join('&')

  const url = `${env.SUPABASE_URL}/rest/v1/${table}?${params}&limit=5`
  const res = await fetch(url, {
    headers: {
      apikey:        env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })
  if (!res.ok) return []
  return (await res.json()) as T[]
}

// ── Generic upsert ────────────────────────────────────────────────────────────
// onConflict specifies the unique column(s) used for the upsert merge.
// NOTE: on_conflict must be a URL query param, NOT a Prefer header directive.
export async function upsertRow(
  env: Env,
  table: string,
  row: Record<string, unknown>,
  onConflict: string,
): Promise<{ ok: boolean; data?: SupabaseRow; error?: string }> {
  const url = `${env.SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`
  const res = await fetch(url, {
    method:  'POST',
    headers: headers(env),
    body:    JSON.stringify(row),
  })

  if (!res.ok) {
    const err = await res.text()
    return { ok: false, error: `${res.status}: ${err}` }
  }

  const data = (await res.json()) as SupabaseRow[]
  return { ok: true, data: data[0] }
}

// ── Plain insert (no conflict resolution) ────────────────────────────────────
// Used for community_submissions where every row is intentionally new.
export async function insertRow(
  env: Env,
  table: string,
  row: Record<string, unknown>,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const url = `${env.SUPABASE_URL}/rest/v1/${table}`
  const res = await fetch(url, {
    method:  'POST',
    headers: {
      apikey:         env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization:  `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer:         'return=representation',
    },
    body: JSON.stringify(row),
  })

  if (!res.ok) {
    const err = await res.text()
    return { ok: false, error: `${res.status}: ${err}` }
  }

  const data = (await res.json()) as Array<{ id?: string }>
  return { ok: true, id: data[0]?.id }
}

// ── Update existing row by ID ─────────────────────────────────────────────────
export async function updateRow(
  env: Env,
  table: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const url = `${env.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`
  const res = await fetch(url, {
    method:  'PATCH',
    headers: {
      apikey:         env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization:  `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer:         'return=representation',
    },
    body: JSON.stringify(patch),
  })

  if (!res.ok) {
    const err = await res.text()
    return { ok: false, error: `${res.status}: ${err}` }
  }
  return { ok: true }
}

// ── Archive stale events (older than 7 days past event date) ─────────────────
export async function archiveStaleEvents(env: Env): Promise<number> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const url = `${env.SUPABASE_URL}/rest/v1/events?start_date=lt.${cutoff}&status=neq.archived`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey:         env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization:  `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer:         'return=representation',
    },
    body: JSON.stringify({ status: 'archived' }),
  })
  if (!res.ok) return 0
  const rows = (await res.json()) as unknown[]
  return rows.length
}

// ── Archive stale lost & found (older than 30 days, not reunited) ─────────────
export async function archiveStaleLostFound(env: Env): Promise<number> {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const url = `${env.SUPABASE_URL}/rest/v1/lost_and_found?created_at=lt.${cutoff}&status=neq.reunited&status=neq.archived`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey:         env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization:  `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer:         'return=representation',
    },
    body: JSON.stringify({ status: 'archived' }),
  })
  if (!res.ok) return 0
  const rows = (await res.json()) as unknown[]
  return rows.length
}
