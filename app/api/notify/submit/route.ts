export const runtime = 'edge'

import { sendEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/notify/submit
 *
 * Called client-side (fire-and-forget) after a successful business submission.
 * Sends a warm confirmation to the submitter so they know what happens next.
 *
 * Body: { businessName, businessCity, submitterEmail }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      businessName = 'your business',
      businessCity = 'your city',
      submitterEmail = '',
    } = body

    // No recipient — nothing to send
    if (!submitterEmail) {
      return NextResponse.json({ ok: true })
    }

    const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1f2937;">

  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%); border-radius: 14px; padding: 24px 28px; color: white; margin-bottom: 28px;">
    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; opacity: 0.65; text-transform: uppercase; letter-spacing: 1.2px;">MoHoLocal</p>
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.2;">You're on the map 📍</h1>
  </div>

  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
    Thanks for submitting <strong>${escHtml(businessName)}</strong> to MoHoLocal!
    You're helping make the 209 directory more useful for everyone in ${escHtml(businessCity)}.
  </p>

  <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 8px; font-weight: 600;">
    Here's what happens next:
  </p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 10px 14px; vertical-align: top; color: #f59e0b; font-size: 18px; width: 32px;">1</td>
      <td style="padding: 10px 14px; color: #374151; font-size: 14px; line-height: 1.5; border-bottom: 1px solid #f3f4f6;">
        Our team cross-checks your listing against Google Maps to make sure everything looks right.
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; vertical-align: top; color: #f59e0b; font-size: 18px; width: 32px;">2</td>
      <td style="padding: 10px 14px; color: #374151; font-size: 14px; line-height: 1.5; border-bottom: 1px solid #f3f4f6;">
        Once approved, <strong>${escHtml(businessName)}</strong> goes live in the MoHoLocal directory — visible to everyone searching in ${escHtml(businessCity)}.
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; vertical-align: top; color: #f59e0b; font-size: 18px; width: 32px;">3</td>
      <td style="padding: 10px 14px; color: #374151; font-size: 14px; line-height: 1.5;">
        This usually takes a few business days. If we have any questions, we'll reply to this email.
      </td>
    </tr>
  </table>

  <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
    In the meantime, take a look at what's already listed in ${escHtml(businessCity)} — your neighbors are out there.
  </p>

  <a href="https://www.moholocal.com/directory"
     style="display: inline-block; background: #f59e0b; color: #1e3a5f; font-weight: 800; font-size: 14px; padding: 13px 28px; border-radius: 10px; text-decoration: none;">
    Browse the Directory →
  </a>

  <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
    MoHoLocal · Serving Mountain House, Tracy, Lathrop, Manteca &amp; Brentwood ·
    <a href="https://www.moholocal.com" style="color: #6b7280; text-decoration: underline;">moholocal.com</a>
  </p>

</div>
`

    await sendEmail({
      to: submitterEmail,
      subject: `We got your submission — ${businessName} is in review 🎉`,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notify/submit] Unexpected error:', err)
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
