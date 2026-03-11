// ── MoHoLocal Ingestion Worker ────────────────────────────────────────────────
// Cloudflare Worker with cron triggers.
//
// Cron schedule (all times UTC):
//   0 3 * * 1  →  Monday 03:00 — Directory ingestion
//   0 4 * * 1  →  Monday 04:00 — Events ingestion
//   0 5 * * 1  →  Monday 05:00 — Lost & Found ingestion
//
// ⚠️  TEMPORARY — /run/* manual trigger routes are live for end-to-end testing.
//     Remove them after verification by reverting to the cron-only version.
//
// Deploy: cd workers && npx wrangler deploy
// Tail:   cd workers && npx wrangler tail
// Test:   cd workers && npx wrangler dev --test-scheduled

import { runDirectoryIngestion } from './jobs/directory'
import { runEventsIngestion }    from './jobs/events'
import { runLostFoundIngestion } from './jobs/lostfound'
import { aggregateLogs }         from './lib/logger'
import type { Env, RunLog }      from './lib/types'

export default {
  // ── Cron handler ────────────────────────────────────────────────────────────
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(event, env))
  },

  // ── HTTP handler ─────────────────────────────────────────────────────────────
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url)

    // Health check
    if (url.pathname === '/health') {
      return json({ status: 'ok', worker: 'moho-ingestion', ts: new Date().toISOString() })
    }

    // ── Manual trigger routes (temporary — for end-to-end testing) ────────────
    // These routes run the exact same handlers the cron scheduler uses.
    // Jobs execute synchronously so the response includes live result stats.
    // NOTE: Cloudflare has a 30s wall-clock limit on HTTP handlers.
    // If a job exceeds this the worker returns a partial response via ctx.waitUntil.

    if (url.pathname === '/run/directory') {
      return runJobRoute('directory', () => runDirectoryIngestion(env), ctx)
    }

    if (url.pathname === '/run/events') {
      return runJobRoute('events', () => runEventsIngestion(env), ctx)
    }

    if (url.pathname === '/run/lostfound') {
      return runJobRoute('lostfound', () => runLostFoundIngestion(env), ctx)
    }

    return new Response(
      JSON.stringify({
        worker:  'moho-ingestion',
        routes:  ['/health', '/run/directory', '/run/events', '/run/lostfound'],
        crons:   ['Mon 03:00 UTC — directory', 'Mon 04:00 UTC — events', 'Mon 05:00 UTC — lostfound'],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  },
}

// ── Execute a job and return structured stats ──────────────────────────────────

async function runJobRoute(
  job: string,
  handler: () => Promise<RunLog[]>,
  ctx: ExecutionContext,
): Promise<Response> {
  const startMs = Date.now()

  let logs: RunLog[]
  try {
    // Race the job against a 25-second timeout guard
    // (CF wall-clock limit is 30s — gives us 5s buffer for the response)
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Job timed out after 25s')), 25_000)
    )
    logs = await Promise.race([handler(), timeout])
  } catch (err) {
    // If we timed out, the job is still running via waitUntil in the background
    ctx.waitUntil(handler())
    return json({
      status:  'triggered_async',
      job,
      message: `Job exceeded 25s time budget — running in background. Check wrangler tail for results.`,
      error:   String(err),
      duration_ms: Date.now() - startMs,
    }, 202)
  }

  // Aggregate stats across all RunLog entries
  const stats = logs.reduce(
    (acc, l) => {
      acc.records_discovered += l.discovered      ?? 0
      acc.records_inserted   += l.inserted        ?? 0
      acc.records_updated    += l.updated         ?? 0
      acc.records_skipped    += l.skipped         ?? 0
      acc.records_flagged    += l.flagged         ?? 0
      acc.images_captured    += l.images_captured ?? 0
      acc.images_missing     += l.images_missing  ?? 0
      acc.errors.push(...(l.errors ?? []))
      acc.warnings.push(...(l.warnings ?? []))
      return acc
    },
    {
      records_discovered: 0,
      records_inserted:   0,
      records_updated:    0,
      records_skipped:    0,
      records_flagged:    0,
      images_captured:    0,
      images_missing:     0,
      errors:             [] as string[],
      warnings:           [] as string[],
    }
  )

  aggregateLogs(logs)

  return json({
    status:     stats.errors.length > 0 ? 'completed_with_errors' : 'success',
    job,
    duration_ms: Date.now() - startMs,
    sources_run: logs.map((l) => l.source ?? l.domain),
    ...stats,
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

// ── Utility ───────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
