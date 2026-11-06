# Pet discussions and private messaging — November 5, 2026

Implementation: existing Next.js / Cloudflare / Supabase stack. Hosted migration `20261106012112_pet_discussions_and_private_messages`.

Public discussion reads require a published parent and a visible comment. Confirmed accounts post through a bounded RPC; author identity comes from auth.uid(), never caller metadata. Private report email and reporter UUID are excluded from public column grants and client projections.

Conversation recipients are resolved from a published report's real submitter or a visible comment author. No arbitrary recipient UUID, imported-owner guessing or self-messaging. New ingestion promotion records the confirmed submission author. Sorted participant pairs are unique per report; pair advisory locks serialize starts, sends and blocks. Only participants can read conversations/messages, including when the caller is an admin. Browser roles have no direct write grants.

Daily actor limits: 20 public replies, 5 new conversations, 60 messages, 10 abuse reports. Database advisory locks serialize budgets; new conversation plus first message is atomic. Blocking works in both directions and only the blocker can remove their block. History remains readable. Own comments can be soft-hidden.

Moderators see only individually reported message snapshots and reasons, not entire private conversations. Public comment reports can be hidden after admin review. The private moderation queue and budget event tables have RLS and no resident grants. No end-to-end encryption, background push or email notifications are claimed. Inbox polls only while visible. Participant recipients can copy information, as disclosed in the policy.

49 local regression tests pass, including cross-account/admin isolation, forged authors, direct-write grants, quotas, blocks, report moderation and parent visibility. Hosted advisor check: zero WARN/ERROR; seven INFO notices describe deliberately inaccessible private tables with RLS and no browser policies. See https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy.

Remaining: resident usability pilot, message requests/unread indicators, notification preferences, owner report-status/expiry controls and operational retention tooling. Existing history requires provenance review. No outreach or production test communications were sent.
