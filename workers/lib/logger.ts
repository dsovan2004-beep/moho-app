// ── Logging system for ingestion runs ────────────────────────────────────────
// Each job creates a RunLog and calls helpers on it as it processes records.
// At the end, printLog() outputs a structured summary to console for
// Cloudflare Workers observability (visible in wrangler tail / Dashboard).

import type { RunLog } from './types'

export function createLog(
  domain: RunLog['domain'],
  source: string,
  city?: string,
): RunLog {
  return {
    domain,
    city,
    source,
    discovered:      0,
    inserted:        0,
    updated:         0,
    skipped:         0,
    flagged:         0,
    images_captured: 0,
    images_missing:  0,
    errors:          [],
    warnings:        [],
    run_at:          new Date().toISOString(),
    duration_ms:     0,
    per_source:      {},
  }
}

export function logError(log: RunLog, msg: string): void {
  log.errors.push(msg)
  console.error(`[${log.domain}][${log.city ?? 'all'}] ERROR: ${msg}`)
}

export function logWarning(log: RunLog, msg: string): void {
  if (!log.warnings) log.warnings = []
  log.warnings.push(msg)
  console.warn(`[${log.domain}][${log.city ?? 'all'}] WARN: ${msg}`)
}

export function printLog(log: RunLog, startMs: number): void {
  log.duration_ms = Date.now() - startMs

  const lines = [
    `╔══════════════════════════════════════════════════════════`,
    `║ MoHoLocal Ingestion Run — ${log.domain.toUpperCase()}`,
    `║ Source : ${log.source}`,
    log.city ? `║ City   : ${log.city}` : null,
    `║ Run at : ${log.run_at}`,
    `║ Took   : ${log.duration_ms}ms`,
    `╠══════════════════════════════════════════════════════════`,
    `║ Discovered      : ${log.discovered}`,
    `║ Inserted        : ${log.inserted}`,
    `║ Updated         : ${log.updated}`,
    `║ Skipped (dupe)  : ${log.skipped}`,
    `║ Flagged (review): ${log.flagged}`,
    `║ Images captured : ${log.images_captured}`,
    `║ Images missing  : ${log.images_missing}`,
    log.warnings?.length > 0
      ? `║ Warnings (${log.warnings.length}):\n${log.warnings.map((w) => `║   ⚠ ${w}`).join('\n')}`
      : `║ Warnings        : 0`,
    log.errors.length > 0
      ? `║ Errors (${log.errors.length}):\n${log.errors.map((e) => `║   • ${e}`).join('\n')}`
      : `║ Errors          : 0`,
    `╚══════════════════════════════════════════════════════════`,
  ].filter(Boolean)

  console.log(lines.join('\n'))

  // ── Structured JSON — machine-readable for Workers Logs / wrangler tail ──
  // When Workers Logs is enabled in Cloudflare dashboard, this line is
  // captured and searchable. Prefix allows easy filtering: grep MOHO_RUN
  console.log('MOHO_RUN ' + JSON.stringify({
    event:           'moho_ingestion_run',
    domain:          log.domain,
    source:          log.source,
    city:            log.city ?? null,
    run_at:          log.run_at,
    duration_ms:     log.duration_ms,
    discovered:      log.discovered,
    inserted:        log.inserted,
    updated:         log.updated,
    skipped:         log.skipped,
    flagged:         log.flagged,
    images_captured: log.images_captured,
    images_missing:  log.images_missing,
    error_count:     log.errors.length,
    warning_count:   log.warnings?.length ?? 0,
    status:          log.errors.length > 0 ? 'error' : 'ok',
    per_source:      log.per_source,
  }))
}

// Aggregate multiple logs into one summary (for the worker router)
export function aggregateLogs(logs: RunLog[]): void {
  const total = {
    discovered:      0,
    inserted:        0,
    updated:         0,
    skipped:         0,
    flagged:         0,
    images_captured: 0,
    images_missing:  0,
    errors:          0,
  }
  for (const l of logs) {
    total.discovered      += l.discovered
    total.inserted        += l.inserted
    total.updated         += l.updated
    total.skipped         += l.skipped
    total.flagged         += l.flagged
    total.images_captured += l.images_captured
    total.images_missing  += l.images_missing
    total.errors          += l.errors.length
  }
  const runAt = logs[0]?.run_at ?? new Date().toISOString()
  console.log(`
╔══════════════════════════════════════════════════════════
║ MoHoLocal WEEKLY INGESTION SUMMARY
╠══════════════════════════════════════════════════════════
║ Total discovered      : ${total.discovered}
║ Total inserted        : ${total.inserted}
║ Total updated         : ${total.updated}
║ Total skipped         : ${total.skipped}
║ Total flagged         : ${total.flagged}
║ Total images captured : ${total.images_captured}
║ Total images missing  : ${total.images_missing}
║ Total errors          : ${total.errors}
╚══════════════════════════════════════════════════════════
  `.trim())

  // ── Structured JSON summary — searchable in Workers Logs ─────────────────
  console.log('MOHO_WEEKLY ' + JSON.stringify({
    event:           'moho_weekly_summary',
    run_at:          runAt,
    jobs:            logs.map((l) => l.domain),
    ...total,
    status:          total.errors > 0 ? 'error' : 'ok',
  }))
}
