# DM notifications and reporter status lifecycle — November 5, 2026

Existing Next.js/Cloudflare/Supabase architecture retained. Hosted migration: 20261106014512_pet_activity_notifications_and_status.

## Notifications

- Participant-only unread RPC; private read receipts persist with the authenticated account. No browser direct writes or read receipts for another user.
- Delivery sequence, rather than timestamps, orders messages and unread cursors. Existing pair advisory locks serialize delivery; a cursor cannot move backwards or accept an invented timestamp/sequence. Only a real message belonging to the caller's conversation can advance it.
- Global unread badges/banner, per-conversation counts and visible-inbox marking. A message arriving after the fetched cursor stays unread. Blocked conversations are omitted from alerts; history remains readable.
- Optional browser notifications require the resident's permission and device opt-in. No sender name or message text in the alert; device watermark suppresses duplicate alerts across tabs. Initial load shows unread counts without replaying old alerts. Polling runs while the document is visible.
- Email and closed-app push remain unimplemented and are explicitly disclosed. No notification permissions were granted and no production test messages were sent.

## Reporter status

- Only the linked reporter can confirm lost/found/reunited, archive a report or restore their own archived report. No imported-report ownership inference.
- Moderator holds/ingestion archive cannot be overridden. Revision checks reject stale updates. Twenty status updates per day, private previous/new status audit and confirmation timestamps.
- Recent pet board includes reports added or reporter-confirmed in the last 30 days; status confirmation is labeled as a reporter statement, not independent proof of outcome. Archive hides the public report and discussion while preserving history.
- `/my-pet-reports` is account-scoped and noindex. Original submissions may not appear until moderation promotes them. Automatic expiry and broader report editing remain follow-ups.

## Supply

Five new individually researched records published. Primary sources and qualification notes are recorded in docs/research/provider-supply-followup-2026-11-05.json. Twenty-three website-checked records total. Mountain House: landscaping 4, handyman 3, house cleaning 3, plumbing 3. Tracy: landscaping 4, handyman 3, house cleaning 4, plumbing 4. These counts reuse providers across service areas rather than duplicating business records.

## Validation

55 local regression tests pass; main/ingestion TypeScript and OpenNext build pass. Hosted advisor: zero WARN/ERROR; eight INFO notices are intentionally inaccessible private RLS tables. Existing 36 unresolved provider identities and eleven unsourced pet history records remain held/nonpublic pending evidence. Browser/native deployment acceptance pending.
