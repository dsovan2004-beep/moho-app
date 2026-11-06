# Notification delivery and pet freshness — November 5, 2026

Implemented on the existing Next.js, Cloudflare and Supabase stack. Source deployment and browser acceptance are tracked below separately from implementation.

## Implemented and database applied

- Hosted migration `20261106043716_delivery_notifications_and_pet_expiry`: all 60 existing reports receive a deadline based on their original date or latest reporter confirmation. Reports leave public results immediately at the deadline through RLS. A five-minute scheduled pass records `expired` and a revisioned private history entry. Nothing is deleted or automatically marked reunited. Linked reporters can confirm a real status and renew for 30 days, subject to moderation holds and revision checks.
- Confirmed-account notification preferences default off. Email recipients are resolved from `auth.users`, never a caller-supplied address. Up to five active device subscriptions per account; subscription keys/addresses remain in the private schema and cannot be transferred to another account.
- Generic alerts contain no sender name, report location or private message text. A notification-only service worker supports closed-tab push without caching private pages. Home Screen metadata/icons support installation; iPhone/iPad users must open the installed web app to enable supported push.
- Durable jobs use unique recipient/device/message ceilings, five-minute leases, bounded retries and a 20-hour delivery window. Read cursors, blocks, confirmed email and opt-in are rechecked at claim time. Email requests use a stable Resend idempotency key. Push 404/410 retires the subscription; redirects and non-allowlisted endpoint hosts are rejected. At-least-once push may still repeat after an acknowledgment failure; the notification tag replaces the prior generic alert.
- Per-account email cooldown: 30 minutes and at most four jobs per day. Per-device push cooldown: 15 minutes and at most 20 jobs per day. Delivery is best effort, not an emergency channel. A provider-accepted alert is not proof that a person saw it. Opt-out cannot recall an alert already accepted by the provider.
- Unsubscribe links require an unguessable token. GET shows a confirmation page; POST disables future message emails, including provider one-click unsubscribe. UI supports device removal and logout attempts to unsubscribe the current browser before ending its session.
- New cron `*/5 * * * *` returns before the existing hour-based ingestion router. Existing Monday/Thursday ingestion expressions remain unchanged.

## Validation

67 local regression tests pass, including immediate expiry, reporter renewal, anonymous/unconfirmed denials, service-only dispatch, device ownership, opt-in baseline, generic encrypted push, email idempotency/unsubscribe, read/block/opt-out cancellation, leases, retries, endpoint retirement and cooldown. Root/Worker TypeScript and OpenNext build pass. New dependency pinned to `@block65/webcrypto-web-push@2.0.0`; dependency audit reports zero known vulnerabilities. Hosted security advisor: zero WARN/ERROR, 12 INFO for intentionally private tables with RLS and no browser policies. No real resident emails, OS push prompts, production messages or fake pet reports used for tests.

## Provider additions

Three deduplicated first-party website additions published with private audit snapshots and public scoped check evidence. Total checked listings: 26. Mountain House: landscaping 6, handyman 3, house cleaning 3, plumbing 3. Tracy: landscaping 5, handyman 3, house cleaning 4, plumbing 5. Sources and exclusions: `research/provider-delivery-pass-2026-11-05.json` and its matching transaction SQL. These are website desk checks, not owner confirmations or credential/availability/quality endorsements.

## Deployment and operational gate

VAPID private key installed as an encrypted ingestion Worker secret; public counterpart committed in app/Worker configuration. Email readiness remains false until the MoHoLocal sender is verified and a send-only credential installed. Resend domain registration and DNS preparation are in progress; existing unrelated sender domains, incoming MX records and root SPF must be preserved. Runtime secret values are never copied into source, evidence or logs. No paid plan upgrade is authorized.

Native builds, live UI checks and actual delivery qualification: pending. Browser/system permission remains each resident’s choice. End-to-end delivery to a real opted-in test account has not been claimed.

## Technical references

[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Resend send API](https://resend.com/docs/api-reference/emails/send-email), [Web Push subscribe](https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe), [WebKit Home Screen push](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
