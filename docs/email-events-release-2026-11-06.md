# Email events, phone setup and regional navigation — November 6, 2026

## Shipped behavior

Automatic outbound email lifecycle handling now consumes a private Cloudflare queue. Only events matching the expected account, sending zone, moholocal.com domain, hello@moholocal.com sender, schema and subscription are accepted. The Worker sends minimal event fields to the service-only dispatcher. There is no public webhook or arbitrary recipient endpoint.

Accepted and delivered remain separate: the existing job status `sent` means provider acceptance; `delivery_status` records mail-server delivery, deferral, bounce, failure, rejection or complaint. Deferred sends stay with Cloudflare's own retries. Duplicate or late delivery events cannot erase failure/complaint states. Events arriving before the acceptance ID is saved are reconciled afterward and on scheduled passes. Unmatched events do not block the bounded reconciliation batch.

Bounces, spam complaints and recipient suppression pause the affected address, turn off that account's matching-address email preference and cancel queued mail for that address. The same address cannot self-enable around the pause. Events for an old address do not disable a newly confirmed account address. Internal/sender failures are recorded without permanently blaming the recipient. Inbox and push access continue. Operator review is needed to restore a paused address; no public suppression-management API was added.

Only event/message IDs, recipient address, classified status and timestamps are retained privately. Subjects, message bodies, SMTP responses and raw provider details are excluded. RLS remains on; app administrators and residents cannot read these private tables or submit delivery events.

## Infrastructure

- Existing Workers Paid plan; no plan upgrade or new management credential.
- Queue `moho-email-events`, ID `b32bdd1df354453e8be13990078b22f5`; 24-hour retention.
- Dead-letter queue `moho-email-events-dlq`; four-day retention, five retries before parking failures.
- Subscription `89656ac6fc6947e1943a4442f450b5d3`, named `moho-transactional-delivery`, scoped to zone `e7be27d26dabc4e883c28c107c4c6f71` and domain moholocal.com. Six lifecycle event kinds subscribed.
- Consumer `moho-ingestion`, batch 10, timeout 5 seconds, max concurrency 1, retry delay 60 seconds.
- Consumer configured once using existing operator CLI authorization; narrow native Build token permissions were not expanded. Current Wrangler deploy leaves externally configured consumers intact when no consumer config is supplied. Verify consumer association after deploys.
- Existing 500-attempt/31-day email budget remains, including operator tests and retries. Account-wide included allowances remain shared; queue retention and bounded retries prevent unbounded replay.

Reproducible setup commands (already executed; do not recreate duplicate subscriptions):

```sh
npx wrangler queues consumer worker add moho-email-events moho-ingestion --batch-size 10 --batch-timeout 5 --message-retries 5 --retry-delay-secs 60 --dead-letter-queue moho-email-events-dlq --max-concurrency 1
npx wrangler queues info moho-email-events
```

Review failures and dead letters in Cloudflare's Queues dashboard. Database/network failures retry; persistent failures remain in the dead-letter queue for operator review rather than being silently acknowledged. In-app operator paging and automated dead-letter replay are not implemented. Paused recipients are not automatically unpaused by a later delivery event. Stop the email pilot if queue health is uncertain; accepted email cannot be recalled.

## Actual production acceptance

Operator-only email test job `8785fc2b-8150-435d-aebf-bf081c601230` was queued after deployment. No fake DM, pet post or resident subscription was created. The account's email opt-in remained off.

At 2026-11-06T08:10:15.837Z, Cloudflare reported mail-server delivery; event `01a1afe8-8bac-7c33-b0b1-5789c6f5b7ff` was consumed and matched to the real job at 08:10:21.404970Z. One attempt. Job `delivery_status=delivered`. Native queue execution completed without an exception. This confirms actual event subscription → queue → Worker → private database reconciliation. It does not guarantee Inbox placement, and a live bounce or spam complaint was not intentionally induced.

Failure/complaint, duplicate, old-address, early-event, wrong-recipient, synchronous suppression, role denial and starvation paths were exercised against the isolated local database. Queue filtering/ack/retry and phone setup logic tests pass. Total regression count: 90. Both TypeScript projects pass. Hosted advisors: zero WARN/ERROR, 15 INFO notices for intentionally private deny-by-default RLS tables.

Hosted migrations: `20261106080659_email_delivery_events_and_suppressions` and `20261106080820_email_event_reconciliation_fairness`.

## Phone testing boundary

No phone browser/control surface is exposed by this session. `devicectl`, Android adb and libimobiledevice tools are unavailable; iPhone Mirroring is not an available computer-use app. Physical iPhone/Android notification delivery, fully quit browser behavior and native banner interaction remain unverified. No new phone permission or subscription was fabricated.

Implemented and tested: iPhone/iPad Home Screen requirement, iPad desktop identity detection, Android feature support, HTTPS/unsupported browsers and blocked-permission guidance. Device labels identify phone class without storing the user agent. Self-test buttons name their registered target. Residents can queue an owned-device test, close the app and inspect browser-confirmed received/displayed/opened receipts afterward.

A Chrome simulation using an iPhone user agent verified that installation instructions appear and the push-enable button is withheld in a non-installed browser. This is **setup simulation, not a real iPhone delivery test**. Screenshot: `docs/ux/phone-install-guidance-simulation.png`. The simulated tab was closed afterward, removing its temporary user-agent and viewport overrides.

## City navigation and supply

The screenshot-reported South Bay links were removed from the shared Directory menu, city picker and directory filter choices. They now advertise Mountain House, Tracy, Lathrop and Manteca. Legacy explicit city URLs/data remain readable. A 320px check found the picker extending beyond the viewport; its mobile dropdown now uses viewport-bounded positioning. Final live acceptance is recorded in deployment evidence.

Three more source-checked providers published after exact-name, normalized-phone and website dedup: JT Landscape Management (Tracy coverage confirmed; historical Mountain House project captions do not establish current coverage), Golden Valley Materials (supplier, not an installer), and Espinosa Power Washing (exterior cleaning, not recurring maid service). No license, insurance, availability, ratings or quality endorsement. All original rows preserved; 31 checked records, 20 unique launch-category providers. Coverage MH landscaping/handyman/house cleaning/plumbing 6/4/3/3; Tracy 6/4/4/5.

## References

[Cloudflare email lifecycle events](https://developers.cloudflare.com/email-service/reference/event-subscriptions/), [event subscription management](https://developers.cloudflare.com/queues/event-subscriptions/manage-event-subscriptions/), [queue pricing](https://developers.cloudflare.com/queues/platform/pricing/). Seasonal engagement planning is in `docs/research/seasonal-pilot-2026-11-06.md`; no seasonal feature was claimed deployed in this release.

## Final native deployment and UI acceptance

Web source 92eb39f, version 130ffd24-0ba9-4a51-bbd3-2b594b59f382; native build df1c4c32-f9f9-4de6-b30d-7ea04163ee32 succeeded. Ingestion source 7fddc34, version 32503498-15cb-4e3d-af9e-c0c1f1823351; native build 49090e37-96df-479f-9846-5b0ea796102f succeeded. Queue has one registered consumer, moho-ingestion.

Live signed-in settings show the real operator email's mail-server acceptance, the previous desktop push receipt and device-named self-test action. The corrected 320px city picker has innerWidth/clientWidth/scrollWidth all 320. Desktop menu and mobile picker show exactly the four launch cities. Temporary viewport override cleared; simulated tab closed; inbox retained as the deliverable. Screenshots are in docs/ux/. Seasonal pilot added to backlog, roadmap and sprint R4; no new seasonal event was published.
