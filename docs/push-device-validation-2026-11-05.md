# Delivery validation — November 5, 2026

## Email

The shared Resend Free account shows 3,600 / 3,000 monthly usage. The earlier Resend operator test was accepted and then failed; that test is not delivery evidence.

Cloudflare Workers Paid was already active before this work. Cloudflare Email Service includes 3,000 outbound messages per billing month on that existing plan. No plan upgrade, additional recurring purchase, new API key or unrelated project change was made. No prior sending domains or billable Email Service usage were shown at onboarding.

moholocal.com was onboarded through the existing account. The dashboard confirmed Sending Enabled and DNS Configured. New cf-bounce MX/SPF/DKIM and root DMARC records were added; incoming root MX and Resend records were preserved. Binding is restricted to hello@moholocal.com. No runtime Cloudflare management token is used.

One operator-only test through an actual remote native email binding initially returned E_EMAIL_SENDING_NOT_READY during setup. A subsequent attempt was accepted with message ID `<v2TJNXaF90C04ndKRuINucgdCnrnfPbeAce3@moholocal.com>` and was independently found in the operator Gmail **Inbox**, subject “MoHoLocal email delivery validation — November 5”, 9:32 PM. Screenshot: `docs/ux/operator-email-delivered.png`. This verifies that test reached Gmail Inbox; it does not guarantee future inbox placement or resident delivery.

The ingestion Worker uses native EMAIL.send with a fixed sender, confirmed opted-in database recipient, generic text and token unsubscribe. Acceptance IDs are private; accepted is not labeled delivered. Native suppression/invalid-recipient errors stop a job. Setup/rate/transient errors retry. The private database serializes an overall **500 email attempts in 31 days** budget, including retries, below the included allowance; account-wide use must still be monitored. Leases and bounded retry protect the queue; ambiguous transport failures can still result in at-least-once delivery. No exactly-once claim.

Automatic asynchronous delivery/failure event reconciliation remains a follow-up. During this limited pilot, review Cloudflare activity/suppression status and queue failures, pause EMAIL_SENDER_ENABLED if sending health is uncertain, and do not equate a saved provider ID with final delivery. The old Resend runtime secret is unused; removal can follow after rollback review.

Official references: [pricing](https://developers.cloudflare.com/email-service/platform/pricing/), [native binding restrictions](https://developers.cloudflare.com/email-service/configuration/send-bindings/), [Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/), [real remote binding tests](https://developers.cloudflare.com/email-service/observability/local-development/sending/).

## Push

An actual Chrome device was registered using its native Allow notifications prompt. Operator-owned device ID: `dbaf1534-1fd5-44d7-9b72-d2a50e3c5184`. Self-test job `27e2c35e-575a-4521-8603-4958ee108a0b` was queued at 9:29 PM, and that inbox tab was closed before delivery. No pet report, comment or DM was fabricated.

Private self-tests use the actual scheduled encrypted delivery queue, with three/day and 15-minute spacing. Only the owner can enqueue on their device. Random receipt capabilities are disclosed only inside encrypted self-test payloads. Received/displayed/opened receipt timestamps are idempotent and limited to self-tests; ordinary DMs send no display/open telemetry. Self-tests do not advance real message cursors or cooldowns.

The real test uncovered two runtime-specific issues omitted by local mocks: (1) hosted authenticator sessions preload safeupdate, so the singleton settings update requires an explicit WHERE predicate; migration 20261106053915 fixes it while preserving the safeguard; (2) Cloudflare Workers rejects redirect:error. The real local workerd runtime reproduced its TypeError while redirect:manual reached FCM with HTTP404 at the root probe. Push now uses manual redirects and rejects non-success status rather than following Location.

Scheduled 9:40 PM pass succeeded against the hosted database and enabled email readiness. Its push send was retained for retry after the unsupported redirect setting. The 9:45 PM scheduled retry on deployed ingestion version b093345a-e324-45f0-bb95-e0e45d052ccd completed successfully. The test job is sent (provider accepted), with two actual attempts total. Chrome received it at **2026-11-06T05:45:15.885771Z** and confirmed showNotification completion at **05:45:15.902575Z**. The test inbox tab was closed, Chrome was running, and no new inbox tab was opened until after receipts were read from the database. This is actual device/browser delivery, not a simulated push event. Other pre-existing MoHoLocal tabs were not closed. Native OS banner visibility and notification-click/opened receipt were not observed; opened_at remains null. A Notification Center inspection timed out, so no OS screenshot claim. Live UI then showed “Browser confirmed notification display”. Screenshot: `docs/ux/push-device-confirmed-mobile.png`; 390px document width matches viewport, and temporary viewport override was cleared.

## Data and checks

Two individually primary-site-checked providers were added after exact name, normalized phone and website dedup returned no match: Mountain House Handyman — Matt Disko, and California Janitorial Services LLC. Both remain unclaimed, with no stars/reviews/photos invented. The handyman listing prominently states the operator is not a CSLB contractor; the specialist cleaning provider is not counted as recurring house cleaning. Residential street addresses omitted.

Both new public business pages were checked on production for correct names, phone/website, dated website-check labels, named service areas, unclaimed status and no invented reviews.

28 listing checks; 1,976 business rows, preserving all originals. Category coverage: Mountain House landscaping 6 / handyman 4 / house cleaning 3 / plumbing 3; Tracy 5 / 4 / 4 / 5. Sources and transaction: `docs/research/provider-device-pass-2026-11-05.json` and `apply-provider-device-pass-2026-11-05.sql`.

75 isolated regressions pass, including account ownership, no fictitious conversations, receipt capabilities, budget including retries, suppression vs transient handling, and private RLS access. Root and Worker TypeScript pass. Hosted security advisors: zero WARN/ERROR, 13 intentional deny-by-default private RLS INFO findings. Native deployment results are recorded in deployment-evidence.json. iOS/Android, fully quit browser behavior, OS banner visibility, resident usability and owner confirmations remain separate acceptance work.

## Native release and next work

- Web source ffcbedc, version 805e260a-a33d-44e7-bcc2-552763928142, native build 2edbaa42-f3b6-4965-8768-f3d358025de6: success.
- Ingestion source 8c982b6, version b093345a-e324-45f0-bb95-e0e45d052ccd, native build b696ba3d-581b-481c-8e13-0fbd40668965: success.
- Push self-test source aee151c web/ingestion builds both succeeded. Email migrations 20261106053247 and safeupdate fix 20261106053915 are hosted and tracked locally.
- Production settings show available email opt-in, one owned push device, and browser-confirmed self-test display. Operator email opt-in remains off; push permission remains enabled as requested for device testing. No resident email/DM was sent.
- Remaining: phone and fully quit browser tests; asynchronous email events and failure reconciliation; provider owner confirmations; service-area-aware related-provider cards and primary contact preference for request-form-first operators; resident pilot.
- Local email and fetch probe servers stopped. Temporary browser viewport cleared. Inbox tab retained as the live deliverable.
