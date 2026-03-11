// ── MoHoLocal Ingestion Worker ────────────────────────────────────────────────
// Cloudflare Worker with cron triggers + manual run/validate HTTP routes.
//
// Cron schedule (all times UTC):
//   0 3 * * 1  →  Monday 03:00 — Directory ingestion
//   0 4 * * 1  →  Monday 04:00 — Events ingestion
//   0 5 * * 1  →  Monday 05:00 — Lost & Found ingestion
//
// HTTP routes:
//   GET /health              — health check
//   GET /run/directory       — trigger directory ingestion manually
//   GET /run/events          — trigger events ingestion manually
//   GET /run/lostfound       — trigger lost & found ingestion manually
//   GET /validate            — validate all known source URLs and report verdicts
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
import type { Env }              from './lib/types'

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
      routes: ['/health', '/run/directory', '/run/events', '/run/lostfound', '/validate'],
      crons:  ['Mon 03:00 UTC (directory)', 'Mon 04:00 UTC (events)', 'Mon 05:00 UTC (lost & found)'],
    })
  },
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
