export const runtime = 'edge'

import { sendEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/notify/claim
 *
 * Called client-side (fire-and-forget) after a successful claim submission.
 * Sends a founder alert with claimant details and a direct link to the listing.
 *
 * Body: { businessId, businessName, businessCity, ownerName, ownerPhone, ownerEmail, role }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      businessId = '',
      businessName = 'Unknown',
      businessCity = '',
      ownerName = '',
      ownerPhone = '',
      ownerEmail = '',
      role = 'Owner',
    } = body

    const notifyEmail = process.env.NOTIFY_EMAIL
    if (!notifyEmail) {
      console.warn('[notify/claim] NOTIFY_EMAIL not set — skipping')
      return NextResponse.json({ ok: true })
    }

    const businessUrl = `https://www.moholocal.com/business/${businessId}`

    const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1f2937;">

  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%); border-radius: 14px; padding: 24px 28px; color: white; margin-bottom: 28px;">
    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; opacity: 0.65; text-transform: uppercase; letter-spacing: 1.2px;">MoHoLocal — Admin Alert</p>
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.2;">🏷️ New Claim Request</h1>
  </div>

  <p style="color: #374151; font-size: 15px; margin-bottom: 20px;">
    A business owner just submitted a claim and is waiting for verification.
  </p>

  <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 10px; overflow: hidden;">
    <tr>
      <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 110px; background: #f3f4f6;">Business</td>
      <td style="padding: 12px 16px; font-weight: 700; color: #111827; font-size: 15px;">${escHtml(businessName)}</td>
    </tr>
    <tr>
      <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #f3f4f6;">City</td>
      <td style="padding: 12px 16px; color: #374151;">${escHtml(businessCity)}</td>
    </tr>
    <tr>
      <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #f3f4f6;">Claimant</td>
      <td style="padding: 12px 16px; color: #374151;">${escHtml(ownerName)}</td>
    </tr>
    <tr>
      <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #f3f4f6;">Role</td>
      <td style="padding: 12px 16px; color: #374151;">${escHtml(role)}</td>
    </tr>
    <tr>
      <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #f3f4f6;">Phone</td>
      <td style="padding: 12px 16px; color: #374151;">${escHtml(ownerPhone) || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #f3f4f6;">Email</td>
      <td style="padding: 12px 16px; color: #374151;">${escHtml(ownerEmail)}</td>
    </tr>
  </table>

  <div style="margin-top: 24px;">
    <a href="${businessUrl}"
       style="display: inline-block; background: #f59e0b; color: #1e3a5f; font-weight: 800; font-size: 14px; padding: 13px 28px; border-radius: 10px; text-decoration: none;">
      View Listing &amp; Verify →
    </a>
  </div>

  <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
    MoHoLocal · Mountain House, Tracy, Lathrop, Manteca &amp; Brentwood ·
    <a href="https://www.moholocal.com/admin" style="color: #6b7280; text-decoration: underline;">Admin →</a>
  </p>

</div>
`

    await sendEmail({
      to: notifyEmail,
      subject: `🏷️ Claim Request — ${businessName} (${businessCity})`,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notify/claim] Unexpected error:', err)
    // Never return a 5xx — client called this fire-and-forget
    return NextResponse.json({ ok: false })
  }
}

/** Escape HTML special chars to prevent injection in email body */
function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
