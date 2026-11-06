import Link from 'next/link'
import { OPERATOR_CONTACT, POLICY_UPDATED } from '@/lib/site-policy'
export const runtime = 'nodejs'
export const metadata = { title: 'Terms & Community Rules | MoHoLocal', alternates: { canonical: 'https://www.moholocal.com/terms' } }
export default function TermsPage() {
  return <article className="max-w-3xl mx-auto px-4 py-10 text-slate-700 leading-relaxed">
    <p className="text-sm mb-3"><Link href="/" className="underline">Home</Link> / Terms</p>
    <h1 className="text-3xl font-bold text-[#19352d]">Terms & community rules</h1>
    <p className="mt-3 text-sm">Effective and last updated: {POLICY_UPDATED}</p>
    <p className="mt-6">These terms describe use of MoHoLocal’s directory and community features. Please review them before creating an account or submitting content. Our <Link href="/privacy" className="underline">Privacy Policy</Link> explains information handling.</p>
    <h2 className="text-xl font-bold mt-8 mb-3">Directory information and business relationships</h2>
    <p>MoHoLocal helps residents discover and contact businesses. Listings, owner claims and website information checks have different meanings. A check confirms only the fields and source described on that listing; it is not an endorsement or a guarantee of quality, licensing, insurance, pricing, availability or safety. Confirm your exact job, address, credentials and terms directly with the business. Any purchase, hiring decision or service agreement is between you and that provider.</p>
    <h2 className="text-xl font-bold mt-8 mb-3">Accounts, listings and ownership claims</h2>
    <p>Account and posting features are intended for adults. Use accurate account information, keep sign-in credentials private and do not impersonate another person or business. Submit business information and ownership evidence only when you have authority to do so. Requests remain subject to review; submission does not guarantee publication or ownership. Claims do not transfer business ownership or establish professional credentials.</p>
    <h2 className="text-xl font-bold mt-8 mb-3">Discussion threads and private messages</h2>
    <p>Use pet discussions for relevant sightings, questions and updates. A report’s date and recorded status may be out of date; confirm with its reporter before acting or resharing. Public pet reports expire after 30 days without confirmation. Expiry means the report needs updating; it does not mean a pet was found. Linked reporters can renew a report unless moderation has paused it. Private messages are for useful, relevant contact with another participant. They are visible to the conversation participants; reported message content can be reviewed by moderators. Do not assume a recipient’s display name or message proves their identity or authority.</p>
    <ul className="list-disc pl-6 space-y-2 mt-3">
      <li>No harassment, threats, scams, spam, impersonation or attempts to bypass another person’s block.</li>
      <li>Do not publish someone else’s private phone number, address, account details or sensitive information without permission.</li>
      <li>Post only content and images you have the right to share. Do not copy private group posts or member information without authorization.</li>
      <li>Do not send passwords, payment credentials or identity documents. Be cautious about unsolicited payments or demands relating to a missing pet.</li>
      <li>Do not treat this service as an emergency channel. Contact the appropriate local emergency or animal services directly when immediate help is needed.</li>
    </ul>
    <h2 className="text-xl font-bold mt-8 mb-3">Your content and moderation</h2>
    <p>You retain your rights in content you submit. You give MoHoLocal permission to store, display and process that content as needed to operate the feature you chose and moderate abuse. Public submissions may be edited for formatting, corrected, held for review or removed. Private messages are not republished as public content by that permission.</p>
    <p className="mt-3">We may limit activity, hide content or restrict accounts that violate these rules or threaten service integrity. Reporting and blocking controls help manage unwanted contact. Reporting does not guarantee a particular outcome or immediate response. Corrections and moderation concerns can be sent to <a className="underline break-all" href={`mailto:${OPERATOR_CONTACT}?subject=MoHoLocal%20support`}>{OPERATOR_CONTACT}</a>.</p>
    <h2 className="text-xl font-bold mt-8 mb-3">Availability, changes and questions</h2>
    <p>Information may be incomplete, inaccurate or unavailable, and features may change. We do not guarantee continuous availability, a provider response, a pet’s recovery or the accuracy of another user’s content. These statements do not remove rights that applicable law gives you. Updates to these terms will appear here with a revised effective date.</p>
    <p className="mt-8 border-t pt-5">Contact the MoHoLocal team at <a className="underline break-all" href={`mailto:${OPERATOR_CONTACT}?subject=MoHoLocal%20terms`}>{OPERATOR_CONTACT}</a>, or return to the <Link className="underline" href="/directory">directory</Link>.</p>
  </article>
}
