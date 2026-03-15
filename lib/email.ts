/**
 * lib/email.ts
 *
 * Thin wrapper around the Resend REST API.
 * Uses native fetch — no npm package required, Edge Runtime compatible.
 *
 * Fails silently if RESEND_API_KEY is not set (dev environments).
 * The main user flow (Supabase write) always completes regardless of
 * email delivery status — email is supplemental, never blocking.
 *
 * Required env vars:
 *   RESEND_API_KEY   — from resend.com (free tier is sufficient)
 *   NOTIFY_EMAIL     — founder/admin address for claim alerts
 */

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    // No key configured — skip silently (expected in local dev)
    console.warn('[email] RESEND_API_KEY not set — email skipped:', opts.subject)
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MoHoLocal <hello@moholocal.com>',
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[email] Resend error:', res.status, text)
    }
  } catch (err) {
    // Network error — log but never propagate to caller
    console.error('[email] Fetch failed:', err)
  }
}
