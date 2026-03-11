// ── MoHoLocal Ingestion Worker ────────────────────────────────────────────────
// Cloudflare Worker with cron triggers.
// Routes scheduled events to the correct domain handler.
//
// Cron schedule (all times UTC):
//   0 3 * * 1  →  Monday 03:00 — Directory ingestion
//   0 4 * * 1  →  Monday 04:00 — Events ingestion
//   0 5 * * 1  →  Monday 05:00 — Lost & Found ingestion
//
// Each handler is fully independent — a failure in one does not block others.
//
// Deploy: cd workers && wrangler deploy
// Tail:   cd workers && wrangler tail
// Test:   cd workers && wrangler dev --test-scheduled

import { runDirectoryIngestion } from './jobs/directory'
import { runEventsIngestion }    from './jobs/events'
import { runLostFoundIngestion } from './jobs/lostfound'
import { aggregateLogs }         from './lib/logger'
import type { Env }              from './lib/types'

export default {
  // ── Cron handler ────────────────────────────────────────────────────────────
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(handleScheduled(event, env))
  },

  // ── HTTP handler (health check + manual trigger) ───────────────────────────
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url)

    // Simple health check
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({ status: 'ok', worker: 'moho-ingestion', ts: new Date().toISOString() }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Manual trigger endpoints (protected by env check)
    if (url.pathname === '/run/directory' && env.APP_ENV !== 'production') {
      ctx.waitUntil(runDirectoryIngestion(env).then(aggregateLogs))
      return new Response('Directory ingestion triggered', { status: 202 })
    }
    if (url.pathname === '/run/events' && env.APP_ENV !== 'production') {
      ctx.waitUntil(runEventsIngestion(env).then(aggregateLogs))
      return new Response('Events ingestion triggered', { status: 202 })
    }
    if (url.pathname === '/run/lostfound' && env.APP_ENV !== 'production') {
      ctx.waitUntil(runLostFoundIngestion(env).then(aggregateLogs))
      return new Response('Lost & Found ingestion triggered', { status: 202 })
    }

    return new Response('MoHoLocal Ingestion Worker', { status: 200 })
  },
}

// ── Route cron trigger to correct handler ─────────────────────────────────────
async function handleScheduled(event: ScheduledEvent, env: Env): Promise<void> {
  const cron = event.cron  // e.g. "0 3 * * 1"

  console.log(`[ingestion-worker] Cron triggered: ${cron} at ${new Date().toISOString()}`)

  try {
    if (cron === '0 3 * * 1') {
      // Monday 03:00 UTC — Directory
      console.log('[ingestion-worker] Starting directory ingestion…')
      const logs = await runDirectoryIngestion(env)
      aggregateLogs(logs)
    }
    else if (cron === '0 4 * * 1') {
      // Monday 04:00 UTC — Events
      console.log('[ingestion-worker] Starting events ingestion…')
      const logs = await runEventsIngestion(env)
      aggregateLogs(logs)
    }
    else if (cron === '0 5 * * 1') {
      // Monday 05:00 UTC — Lost & Found
      console.log('[ingestion-worker] Starting lost & found ingestion…')
      const logs = await runLostFoundIngestion(env)
      aggregateLogs(logs)
    }
    else {
      console.warn(`[ingestion-worker] Unknown cron expression: ${cron}`)
    }
  } catch (err) {
    // Top-level error should never happen (each handler has its own try/catch)
    // but we guard here to prevent silent failures.
    console.error(`[ingestion-worker] Top-level error for cron ${cron}:`, err)
  }
}
