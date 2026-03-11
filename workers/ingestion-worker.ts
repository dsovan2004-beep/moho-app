// ── MoHoLocal Ingestion Worker ────────────────────────────────────────────────
// Cloudflare Worker with cron triggers.
//
// Cron schedule (all times UTC):
//   0 3 * * 1  →  Monday 03:00 — Directory ingestion
//   0 4 * * 1  →  Monday 04:00 — Events ingestion
//   0 5 * * 1  →  Monday 05:00 — Lost & Found ingestion
//
// Deploy: cd workers && npx wrangler deploy
// Tail:   cd workers && npx wrangler tail
// Test:   cd workers && npx wrangler dev --test-scheduled
//         curl "http://localhost:8787/__scheduled?cron=0+3+*+*+1"

import { runDirectoryIngestion } from './jobs/directory'
import { runEventsIngestion }    from './jobs/events'
import { runLostFoundIngestion } from './jobs/lostfound'
import { aggregateLogs }         from './lib/logger'
import type { Env }              from './lib/types'

export default {
  // ── Cron handler ────────────────────────────────────────────────────────────
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(event, env))
  },

  // ── HTTP handler — health check only ─────────────────────────────────────────
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url)

    if (pathname === '/health') {
      return new Response(
        JSON.stringify({ status: 'ok', worker: 'moho-ingestion', ts: new Date().toISOString() }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ worker: 'moho-ingestion', crons: ['Mon 03:00 UTC', 'Mon 04:00 UTC', 'Mon 05:00 UTC'] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
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
    // Top-level guard — each handler has its own try/catch but this prevents
    // silent failures if something unexpected escapes.
    console.error(`[ingestion-worker] Top-level error for cron ${cron}:`, err)
  }
}
