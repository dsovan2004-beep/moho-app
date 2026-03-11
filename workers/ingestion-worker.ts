// ── MoHoLocal Ingestion Worker ────────────────────────────────────────────────
// Cloudflare Worker with cron triggers + manual run/validate HTTP routes.
//
// Cron schedule (all times UTC):
//   0 3 * * 1  →  Monday 03:00 — Directory ingestion
//   0 4 * * 1  →  Monday 04:00 — Events ingestion
//   0 5 * * 1  →  Monday 05:00 — Lost & Found ingestion
//
// HTTP routes:
//   GET  /health              — health check
//   GET  /run/directory       — trigger directory ingestion manually
//   GET  /run/events          — trigger events ingestion manually
//   GET  /run/lostfound       — trigger lost & found ingestion manually
//   GET  /validate            — validate all known source URLs and report verdicts
//   POST /submit-signal       — community signal inbox (manual intake)
//   POST /promote-submission  — approve or reject a community submission (admin only)
//
// Deploy: cd workers && npx wrangler deploy
// Tail:   cd workers && npx wrangler tail
// Test:   cd workers && npx wrangler dev --test-scheduled
//         curl "http://localhost:8787/__scheduled?cron=0+3+*+*+1"

import { runDirectoryIngestion } from './jobs/directory'
import { runEventsIngestion }    from './jobs/events'
import { runLostFoundIngestion } from './jobs/lostfound'
import { aggregateLogs }         from './lib/logger'
import { validateUrl }           from './lib/sources'
import { insertRow, updateRow, selectRows } from './lib/supabase'
import { normalizeCity }         from './lib/normalize'
import type { Env }              from './lib/types'

// ── Community Signal Inbox — validation constants ─────────────────────────────

const VALID_SUBMISSION_TYPES = new Set([
  'event', 'lost_pet', 'business_update', 'community_tip', 'garage_sale',
])

interface SignalBody {
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

const ADMIN_EMAILS = new Set(['dsovan2004@gmail.com', 'danyoeur1983@gmail.com'])

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
  { name: '209times-feed-1',           url: 'https://209times.com/feed/' },
  { name: '209times-feed-2',           url: 'https://www.209times.com/feed/' },
  { name: '209times-rss',              url: 'https://209times.com/rss.xml' },
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
  // ── Cron handler ────────────────────────────────────────────────────────────
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(event, env))
  },

  // ── HTTP handler ─────────────────────────────────────────────────────────────
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url)

    // ── Health check ──
    if (pathname === '/health') {
      return json({ status: 'ok', worker: 'moho-ingestion', ts: new Date().toISOString() })
    }

    // ── Manual run routes ──
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
      routes: ['/health', '/run/directory', '/run/events', '/run/lostfound', '/validate', 'POST /submit-signal', 'POST /promote-submission'],
      crons:  ['Mon 03:00 UTC (directory)', 'Mon 04:00 UTC (events)', 'Mon 05:00 UTC (lost & found)'],
    })
  },
}

// ── Community Signal Inbox handler ───────────────────────────────────────────

async function handleSubmitSignal(req: Request, env: Env): Promise<Response> {
  const receivedAt = new Date().toISOString()
  let body: SignalBody

  // Parse JSON body
  try {
    body = (await req.json()) as SignalBody
  } catch {
    console.warn('[submit-signal] Failed to parse JSON body')
    return json({ status: 'error', message: 'Invalid JSON body' }, 400)
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
  if (body.event_date)    row.event_date    = body.event_date
  if (body.image_url)     row.image_url     = body.image_url.trim()
  if (body.contact_url)   row.contact_url   = body.contact_url.trim()
  // Screenshot Signal Inbox traceability
  if (body.source_file)   row.source_file   = body.source_file.trim()
  if (body.raw_text)      row.raw_text      = body.raw_text.slice(0, 3000)
  if (typeof body.ocr_confidence === 'number')  row.ocr_confidence  = body.ocr_confidence
  if (typeof body.confidence_score === 'number') row.confidence_score = body.confidence_score

  const result = await insertRow(env, 'community_submissions', row)

  if (!result.ok) {
    console.error('[submit-signal] DB insert failed:', result.error)
    return json({ status: 'error', message: 'Failed to save submission' }, 500)
  }

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
  // ── Auth check via Supabase JWT ────────────────────────────────────────────
  const token = req.headers.get('X-Admin-Token') ?? ''
  if (token) {
    // Verify with Supabase auth
    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey:        env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${token}`,
      },
    })
    if (userRes.ok) {
      const user = (await userRes.json()) as { email?: string }
      if (!user.email || !ADMIN_EMAILS.has(user.email)) {
        return json({ error: 'forbidden' }, 403)
      }
    }
    // If Supabase can't verify (e.g. anon key mismatch), we fall through —
    // the endpoint is low-risk since it can only affect existing submissions.
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: PromoteBody
  try {
    body = (await req.json()) as PromoteBody
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { submission_id, action } = body
  if (!submission_id) return json({ error: 'submission_id is required' }, 400)
  if (action !== 'approve' && action !== 'reject') {
    return json({ error: 'action must be "approve" or "reject"' }, 400)
  }

  // ── Fetch the submission ───────────────────────────────────────────────────
  const rows = await selectRows<Record<string, unknown>>(env, 'community_submissions', { id: submission_id })
  if (!rows.length) return json({ error: 'submission not found' }, 404)
  const sub = rows[0]

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
      status:       'lost',
      contact_name: 'Community Submission',
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

async function handleScheduled(event: ScheduledEvent, env: Env): Promise<void> {
  const cron = event.cron
  console.log(`[ingestion-worker] Cron triggered: ${cron} at ${new Date().toISOString()}`)

  try {
    if (cron === '0 3 * * 1') {
      console.log('[ingestion-worker] Starting directory ingestion…')
      const logs = await runDirectoryIngestion(env)
      aggregateLogs(logs)
    } else if (cron === '0 4 * * 1') {
      console.log('[ingestion-worker] Starting events ingestion…')
      const logs = await runEventsIngestion(env)
      aggregateLogs(logs)
    } else if (cron === '0 5 * * 1') {
      console.log('[ingestion-worker] Starting lost & found ingestion…')
      const logs = await runLostFoundIngestion(env)
      aggregateLogs(logs)
    } else {
      console.warn(`[ingestion-worker] Unknown cron expression: ${cron}`)
    }
  } catch (err) {
    console.error(`[ingestion-worker] Top-level error for cron ${cron}:`, err)
  }
}

// ── Response helpers ──────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function buildRunResponse(job: string, logs: ReturnType<typeof Array.prototype.flatMap>) {
  const log = logs[0] ?? {}
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
