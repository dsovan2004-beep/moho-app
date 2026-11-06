import {consumeEmailEvents,type EmailEventBatch} from './lib/email-events'
import {NOTIFICATION_CRON,runNotificationDelivery} from './lib/notifications'
// ── MoHoLocal Ingestion Worker ────────────────────────────────────────────────
// Cloudflare Worker with cron triggers + manual run/validate HTTP routes.
//
// Cron schedule (all times UTC):
//   0 3 * * 1  →  Tuesday 03:00 — Directory ingestion
//   0 4 * * 1  →  Tuesday 04:00 — Events ingestion (full weekly refresh)
//   0 5 * * 1  →  Tuesday 05:00 — Lost & Found ingestion
//   0 4 * * 4  →  Friday 04:00 — Events ingestion (mid-week catch-up)
//
// HTTP routes:
//   GET  /health              — health check
//   POST /run/directory       — trigger directory ingestion manually
//   POST /run/events          — trigger events ingestion manually
//   POST /run/lostfound       — trigger lost & found ingestion manually
//   POST /validate            — validate all known source URLs and report verdicts
//   POST /submit-signal       — community signal inbox (manual intake)
//   POST /promote-submission  — approve or reject a community submission (admin only)
//
// Deploy: cd workers && npx wrangler deploy
// Tail:   cd workers && npx wrangler tail
// Test:   cd workers && npx wrangler dev --test-scheduled
//         curl "http://localhost:8787/__scheduled?cron=0+3+*+*+1"

import type { ScheduledEvent, ExecutionContext } from '@cloudflare/workers-types'
import { requireAdmin, readJsonBody } from './lib/admin-auth'
import { runDirectoryIngestion } from './jobs/directory'
import { runEventsIngestion }    from './jobs/events'
import { runLostFoundIngestion } from './jobs/lostfound'
import { aggregateLogs }         from './lib/logger'
import { validateUrl }           from './lib/sources'
import { insertRow, updateRow, selectRows } from './lib/supabase'
import { normalizeCity }         from './lib/normalize'
import type { Env, RunLog }              from './lib/types'

// ── Community Signal Inbox — validation constants ─────────────────────────────

const VALID_SUBMISSION_TYPES = new Set([
  'event', 'lost_pet', 'business_update', 'community_tip', 'garage_sale',
])

interface SignalBody {
  pet_status?: string
  title?:           string
  description?:     string
  city?:            string
  submission_type?: string
  event_date?:      string
  image_url?:       string
  contact_url?:     string
  // Screenshot Signal Inbox traceability fields (optional)
  source_file?:     string   // original filename from signals-inbox/raw/
  raw_text?:        string   // raw OCR-extracted text
  ocr_confidence?:  number   // 0–1 normalized OCR confidence
  confidence_score?: number  // override classification confidence
}

interface PromoteBody {
  submission_id?: string
  action?:        'approve' | 'reject'
}



// ── All known source URLs — used by /validate endpoint ───────────────────────

const ALL_SOURCES = [
  // ── Events: City calendars ──
  { name: 'mountain-house-calendar-1', url: 'https://www.mhcsd.ca.gov/calendar.rss' },
  { name: 'mountain-house-calendar-2', url: 'https://www.mhcsd.ca.gov/site/calendar.xml' },
  { name: 'mountain-house-calendar-3', url: 'https://www.mhcsd.ca.gov/rss.xml' },
  { name: 'tracy-calendar-1',          url: 'https://www.cityoftracy.org/services/news-events/rss' },
  { name: 'tracy-calendar-2',          url: 'https://www.cityoftracy.org/rss.xml' },
  { name: 'tracy-calendar-3',          url: 'https://www.cityoftracy.org/calendar.rss' },
  { name: 'lathrop-calendar-1',        url: 'https://ci.lathrop.ca.us/calendar.rss' },
  { name: 'lathrop-calendar-2',        url: 'https://www.lathropca.gov/calendar.rss' },
  { name: 'lathrop-calendar-3',        url: 'https://www.lathropca.gov/rss.xml' },
  { name: 'manteca-calendar-1',        url: 'https://www.mantecacity.org/calendar.rss' },
  { name: 'manteca-calendar-2',        url: 'https://www.mantecacity.org/rss.xml' },
  { name: 'brentwood-calendar-1',      url: 'https://www.brentwoodca.gov/calendar.rss' },
  { name: 'brentwood-calendar-2',      url: 'https://www.brentwoodca.gov/rss.xml' },
  // ── Events: SJ County ──
  { name: 'sjcounty-news',             url: 'https://www.sjgov.org/rss.xml' },
  { name: 'sjcounty-events',           url: 'https://www.sjgov.org/events/rss' },
  // ── Events + Lost/Found: News RSS ──
  { name: 'tracypress-feed-1',         url: 'https://www.tracypress.com/feed/' },
  { name: 'tracypress-feed-2',         url: 'https://tracypress.com/feed/' },
  { name: 'tracypress-rss',            url: 'https://www.tracypress.com/rss.xml' },
  { name: 'patch-tracy',               url: 'https://patch.com/california/tracy/rss.xml' },
  { name: 'patch-manteca',             url: 'https://patch.com/california/manteca/rss.xml' },
  { name: 'patch-lathrop',             url: 'https://patch.com/california/lathrop/rss.xml' },
  { name: 'patch-brentwood',           url: 'https://patch.com/california/brentwood/rss.xml' },
  // ── Lost & Found: Animal services ──
  { name: 'sjanimal-sjgov',            url: 'https://www.sjgov.org/department/animalservices/rss.xml' },
  { name: 'sjanimal-sjgov-lf',         url: 'https://www.sjgov.org/department/animalservices/lost-found/rss' },
  { name: 'sjanimal-sjacd',            url: 'https://sjacd.org/rss.xml' },
  { name: 'sjanimal-petango',          url: 'https://www.petango.com/Widgets/PostAdoption/FoundAnimals?accountId=19839&size=50' },
  // ── Directory: Chamber RSS ──
  { name: 'chamber-tracy',             url: 'https://www.tracychamber.org/feed/' },
  { name: 'chamber-manteca',           url: 'https://www.mantecachamber.org/feed/' },
  { name: 'chamber-lathrop',           url: 'https://www.lathropchamber.com/feed/' },
  { name: 'chamber-brentwood',         url: 'https://www.brentwoodchamber.com/feed/' },
]

export default {
  async queue(batch: EmailEventBatch, env: Env): Promise<void> { await consumeEmailEvents(batch,env) },
  // ── Cron handler ────────────────────────────────────────────────────────────
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(event, env))
  },

  // ── HTTP handler ─────────────────────────────────────────────────────────────
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url)

    // ── CORS preflight ──
    if (req.method === 'OPTIONS') {
      return corsPreflightResponse()
    }

    // ── Health check ──
    if (pathname === '/health') {
      return json({ status: 'ok', worker: 'moho-ingestion', ts: new Date().toISOString() })
    }

    // Internal intake and expensive/mutating routes require a verified admin.
    const protectedRoutes = ['/run/all', '/run/directory', '/run/events', '/run/lostfound',
      '/validate', '/submit-signal', '/promote-submission']
    if (protectedRoutes.includes(pathname)) {
      if (req.method !== 'POST') return json({ error: 'POST required' }, 405)
      const denied = await requireAdmin(req, env, pathname !== '/submit-signal')
      if (denied) return new Response(denied.body, { status: denied.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } })
    }

    // ── Manual run routes ──

    // /run/all — run all three jobs in sequence (use for debugging + manual verification)
    if (pathname === '/run/all') {
      const startedAt = new Date().toISOString()
      const results: Record<string, unknown> = {}

      console.log('[manual] /run/all triggered at', startedAt)

      try {
        console.log('[manual] START directory')
        const dirLogs = await runDirectoryIngestion(env)
        aggregateLogs(dirLogs)
        results.directory = buildRunResponse('directory', dirLogs)
        console.log('[manual] END directory — inserted:', dirLogs[0]?.inserted ?? 0)
      } catch (err) {
        console.error('[manual] FAIL directory:', String(err))
        results.directory = { error: String(err) }
      }

      try {
        console.log('[manual] START events')
        const evtLogs = await runEventsIngestion(env)
        aggregateLogs(evtLogs)
        results.events = buildRunResponse('events', evtLogs)
        console.log('[manual] END events — inserted:', evtLogs[0]?.inserted ?? 0)
      } catch (err) {
        console.error('[manual] FAIL events:', String(err))
        results.events = { error: String(err) }
      }

      try {
        console.log('[manual] START lostfound')
        const lfLogs = await runLostFoundIngestion(env)
        aggregateLogs(lfLogs)
        results.lostfound = buildRunResponse('lostfound', lfLogs)
        console.log('[manual] END lostfound — inserted:', lfLogs[0]?.inserted ?? 0)
      } catch (err) {
        console.error('[manual] FAIL lostfound:', String(err))
        results.lostfound = { error: String(err) }
      }

      return json({ started_at: startedAt, completed_at: new Date().toISOString(), results })
    }

    if (pathname === '/run/directory') {
      const logs = await runDirectoryIngestion(env)
      return json(buildRunResponse('directory', logs))
    }

    if (pathname === '/run/events') {
      const logs = await runEventsIngestion(env)
      return json(buildRunResponse('events', logs))
    }

    if (pathname === '/run/lostfound') {
      const logs = await runLostFoundIngestion(env)
      return json(buildRunResponse('lostfound', logs))
    }

    // ── Community Signal Inbox ────────────────────────────────────────────────
    if (pathname === '/submit-signal' && req.method === 'POST') {
      return handleSubmitSignal(req, env)
    }

    // ── Promote / reject a community submission ───────────────────────────────
    if (pathname === '/promote-submission' && req.method === 'POST') {
      return handlePromoteSubmission(req, env)
    }

    // ── Source validation endpoint ──
    if (pathname === '/validate') {
      const results = []
      for (const src of ALL_SOURCES) {
        const result = await validateUrl(src.name, src.url)
        results.push(result)
      }

      const working  = results.filter((r) => r.verdict === 'WORKING').length
      const dead     = results.filter((r) => r.verdict === 'DEAD').length
      const blocked  = results.filter((r) => r.verdict === 'BLOCKED').length
      const noRss    = results.filter((r) => r.verdict === 'REACHABLE_NO_RSS').length
      const empty    = results.filter((r) => r.verdict === 'REACHABLE_EMPTY').length

      return json({
        summary: { total: results.length, working, dead, blocked, no_rss: noRss, empty },
        sources: results,
      })
    }

    // ── Default ──
    return json({
      worker: 'moho-ingestion',
      routes: [
        '/health',
        '/run/all        — run all 3 jobs now (directory + events + lostfound)',
        '/run/directory  — directory only',
        '/run/events     — events only',
        '/run/lostfound  — lost & found only',
        '/validate       — check all source URLs',
        'POST /submit-signal',
        'POST /promote-submission',
      ],
      crons: [
        'Tue 03:00 UTC — directory     (0 3 * * 2)',
        'Tue 04:00 UTC — events        (0 4 * * 2)',
        'Tue 05:00 UTC — lost & found  (0 5 * * 2)',
        'Fri 04:00 UTC — events midwk  (0 4 * * 5)',
      ],
      routing: 'by UTC hour (3=directory, 4=events, 5=lostfound)',
    })
  },
}

// ── Community Signal Inbox handler ───────────────────────────────────────────

async function handleSubmitSignal(req: Request, env: Env): Promise<Response> {
  const receivedAt = new Date().toISOString()
  let body: SignalBody

  // Parse JSON body
  try {
    body = (await readJsonBody(req)) as SignalBody
  } catch {
    console.warn('[submit-signal] Failed to parse JSON body')
    return json({ status: 'error', message: 'Invalid JSON body' }, 400)
  }

  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.entries(body).some(([key, value]) => !['ocr_confidence', 'confidence_score'].includes(key) && typeof value !== 'string')) {
    return json({ status: 'error', message: 'Invalid field types' }, 422)
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const validationErrors: string[] = []

  const title = (body.title ?? '').trim()
  if (title.length < 5) {
    validationErrors.push('title must be at least 5 characters')
  }

  const description = (body.description ?? '').trim()
  if (!description) {
    validationErrors.push('description is required')
  }

  const submissionType = (body.submission_type ?? '').trim()
  if (!VALID_SUBMISSION_TYPES.has(submissionType)) {
    validationErrors.push(`submission_type must be one of: ${[...VALID_SUBMISSION_TYPES].join(', ')}`)
  }

  const city = normalizeCity(body.city ?? '')
  if (!city) {
    validationErrors.push('city must be one of: Mountain House, Tracy, Lathrop, Manteca, Brentwood')
  }

  if (validationErrors.length > 0) {
    console.warn('[submit-signal] Validation failed:', validationErrors.join('; '))
    return json({
      status:  'error',
      message: 'validation failed',
      errors:  validationErrors,
    }, 422)
  }

  // ── Insert into community_submissions ───────────────────────────────────────
  const row: Record<string, unknown> = {
    title,
    description,
    city,
    submission_type:  submissionType,
    source:           'community',
    confidence_score: 0.8,
    needs_review:     true,
    submitted_at:     receivedAt,
    created_at:       receivedAt,
  }

  // Optional fields — only include if provided
  if (body.pet_status) row.pet_status = body.pet_status
  if (body.event_date)    row.event_date    = body.event_date
  if (body.image_url)     row.image_url     = body.image_url.trim()
  if (body.contact_url)   row.contact_url   = body.contact_url.trim()
  // Screenshot Signal Inbox traceability
  if (body.source_file)   row.source_file   = body.source_file.trim()
  if (body.raw_text)      row.raw_text      = body.raw_text.slice(0, 3000)
  if (typeof body.ocr_confidence === 'number')  row.ocr_confidence  = body.ocr_confidence
  if (typeof body.confidence_score === 'number') row.confidence_score = body.confidence_score

  // Authenticated, rate-limited RPC saves a pending signal. Never insert using
  // service-role authority on behalf of an arbitrary public caller.
  const token = req.headers.get('Authorization')?.replace(/^Bearer /, '') || req.headers.get('X-Admin-Token')
  const saved = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/create_community_signal`, {
    method: 'POST', headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_payload: row }),
  })
  if (!saved.ok) {
    const error = await saved.json() as { code?: string }
    return json({ status: 'error', message: error.code === 'P0001' ? 'Daily submission limit reached' : 'Submission was not saved' },
      error.code === 'P0001' ? 429 : error.code === '22023' ? 422 : 503)
  }
  const id: unknown = await saved.json()
  if (typeof id !== 'string') return json({ status: 'error', message: 'No saved submission reference' }, 503)
  const result = { id }

  // ── Structured log ──────────────────────────────────────────────────────────
  console.log(JSON.stringify({
    source:               'community',
    event:                'submission_received',
    submission_id:        result.id,
    submission_type:      submissionType,
    city,
    needs_review:         true,
    ts:                   receivedAt,
  }))

  return json({
    status:        'success',
    submission_id: result.id,
    needs_review:  true,
  }, 201)
}

// ── Promote / reject a community submission ───────────────────────────────────
// Auth: the caller must supply the Supabase access_token in X-Admin-Token header.
// The worker verifies the token against Supabase and confirms the email is in
// ADMIN_EMAILS before taking any action.

async function handlePromoteSubmission(req: Request, env: Env): Promise<Response> {
  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: PromoteBody
  try {
    body = (await readJsonBody(req)) as PromoteBody
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { submission_id, action } = body
  if (typeof submission_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(submission_id)) return json({ error: 'Valid submission_id is required' }, 400)
  if (action !== 'approve' && action !== 'reject') {
    return json({ error: 'action must be "approve" or "reject"' }, 400)
  }

  // ── Fetch the submission ───────────────────────────────────────────────────
  const rows = await selectRows<Record<string, unknown>>(env, 'community_submissions', { id: submission_id })
  if (!rows.length) return json({ error: 'submission not found' }, 404)
  const sub = rows[0]
  if (sub.needs_review !== true) return json({ error: 'Submission already reviewed' }, 409)

  // ── Reject: just mark reviewed, no promotion ───────────────────────────────
  if (action === 'reject') {
    await updateRow(env, 'community_submissions', submission_id, { needs_review: false })
    console.log(JSON.stringify({ event: 'submission_rejected', submission_id }))
    return json({ status: 'rejected', submission_id })
  }

  // ── Approve: promote to target table ──────────────────────────────────────
  const submissionType = String(sub.submission_type ?? '')
  let promoted_table: string | null = null
  let promoted_id:    string | undefined

  if (submissionType === 'event') {
    const result = await insertRow(env, 'events', {
      title:       sub.title,
      description: sub.description,
      city:        sub.city,
      start_date:  sub.event_date ?? new Date().toISOString(),
      source:      'community',
      source_url:  sub.contact_url ?? null,
      image_url:   sub.image_url ?? null,
      status:      'approved',
      needs_review: false,
      last_ingested_at: new Date().toISOString(),
    })
    promoted_table = 'events'
    promoted_id    = result.id

  } else if (submissionType === 'lost_pet') {
    const result = await insertRow(env, 'lost_and_found', {
      title:        sub.title,
      description:  sub.description,
      city:         sub.city,
      type:         'pet',
      status:       sub.pet_status ?? 'lost',
      contact_name: 'Community Submission',
      reporter_id: sub.submitted_by ?? null,
      source_url: sub.contact_url ?? null,
      image_url:    sub.image_url ?? null,
      source:       'community',
      needs_review: false,
      last_ingested_at: new Date().toISOString(),
    })
    promoted_table = 'lost_and_found'
    promoted_id    = result.id

  } else if (submissionType === 'community_tip' || submissionType === 'garage_sale') {
    const result = await insertRow(env, 'community_posts', {
      title:       sub.title,
      content:     sub.description,
      city:        sub.city,
      category:    submissionType === 'garage_sale' ? 'For Sale' : 'General',
      author_name: 'Community Tip',
      status: 'approved',
    })
    promoted_table = 'community_posts'
    promoted_id    = result.id

  } else if (submissionType === 'business_update') {
    // business_update: no auto-promote — flag for manual founder review
    promoted_table = null
  }

  // ── Mark submission as reviewed ────────────────────────────────────────────
  await updateRow(env, 'community_submissions', submission_id, { needs_review: false })

  console.log(JSON.stringify({
    event:           'submission_approved',
    submission_id,
    submission_type: submissionType,
    promoted_table,
    promoted_id,
  }))

  return json({
    status:          'approved',
    submission_id,
    promoted_table,
    promoted_id:     promoted_id ?? null,
    note:            submissionType === 'business_update'
      ? 'business_update requires manual founder review — no auto-promote'
      : undefined,
  })
}

// ── Route cron trigger to correct handler ─────────────────────────────────────
//
// Route by UTC HOUR, not by exact cron string.
// Routing by exact string is fragile — any wrangler.toml day-of-week edit
// silently breaks all jobs (they fall through to the else/warn branch).
// Hour-based routing is immune to day-of-week changes.
//
//   Hour 3  → Directory ingestion   (Tue 03:00 UTC)
//   Hour 4  → Events ingestion      (Tue + Fri 04:00 UTC)
//   Hour 5  → Lost & Found          (Tue 05:00 UTC)

async function handleScheduled(event: ScheduledEvent, env: Env): Promise<void> {
  if(event.cron===NOTIFICATION_CRON){await runNotificationDelivery(env);return}

  const cron         = event.cron
  const firedAt      = new Date(event.scheduledTime)
  const utcHour      = firedAt.getUTCHours()

  console.log(`[cron] TRIGGER cron="${cron}" firedAt=${firedAt.toISOString()} utcHour=${utcHour}`)

  try {
    if (utcHour === 3) {
      console.log('[cron] START directory')
      const logs = await runDirectoryIngestion(env)
      aggregateLogs(logs)
      console.log('[cron] END directory')

    } else if (utcHour === 4) {
      // Runs Monday (full weekly refresh) AND Thursday (mid-week catch-up)
      console.log('[cron] START events')
      const logs = await runEventsIngestion(env)
      aggregateLogs(logs)
      console.log('[cron] END events')

    } else if (utcHour === 5) {
      console.log('[cron] START lost-and-found')
      const logs = await runLostFoundIngestion(env)
      aggregateLogs(logs)
      console.log('[cron] END lost-and-found')

    } else {
      console.warn(`[cron] No job mapped for utcHour=${utcHour} cron="${cron}" — check wrangler.toml`)
    }
  } catch (err) {
    console.error(`[cron] FATAL error utcHour=${utcHour} cron="${cron}": ${String(err)}`)
  }
}

// ── Response helpers ──────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  'https://www.moholocal.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token, Authorization',
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

function corsPreflightResponse(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

function buildRunResponse(job: string, logs: RunLog[]) {
  const log = logs[0]
  if (!log) return { job, error: 'No ingestion log returned' }
  return {
    job,
    run_at:          log.run_at,
    duration_ms:     log.duration_ms,
    discovered:      log.discovered,
    inserted:        log.inserted,
    updated:         log.updated,
    skipped:         log.skipped,
    flagged:         log.flagged,
    images_captured: log.images_captured,
    images_missing:  log.images_missing,
    per_source:      log.per_source ?? {},
    errors:          log.errors ?? [],
    warnings:        log.warnings ?? [],
  }
}
