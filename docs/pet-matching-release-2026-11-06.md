# Pet matching and contact updates — November 6, 2026

## Scope

Manual reporter-linked possible matches between published lost and found reports across the four relaunch cities. Each report’s reporter can confirm, rule out or reset their own decision. Pair confirmation requires both report decisions; it does not prove identity/ownership or mark either pet reunited. Duplicate and reversed proposals share one link.

Contact stages: not confirmed, attempted, owner/finder contacted, return arranged. Server-dated reporter updates appear with progress/history; return arranged remains explicitly separate from reunion. No automatic messages, emails or push notifications are sent by these updates. Existing discussions/DM actions remain available. No private FB posts imported.

## Security and hosted state

Hosted migration20261106220449 already applied; local filename reconciled to the actual recorded version. Public wrappers are SECURITY INVOKER; narrowly scoped privileged helpers remain in directory_private with empty search_path and explicit auth/reporter checks. Matching tables are private, RLS enabled and direct browser access revoked. Public projections omit actor IDs, per-side private decisions and private audit data. Both parents must remain published and unexpired; ruled-out links disappear publicly. Existing messaging blocks prevent new links/confirmations. Revision checks and daily budgets apply.

Hosted security advisors:17 INFO RLS-enabled/no-policy findings on intentionally private deny-by-default tables, including the2 new match tables; no WARN/ERROR findings. These are intentional access boundaries, not missing public policies. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy .

Hosted current state:60 legacy reports,0 reporter-linked records,0 eligible public records,0 match links. No production fixtures created.

## Verification

135 repository tests pass, including disposable-local-Postgres authorization, confirmed-account requirements, forged decisions, stale revisions, duplicate/reverse pairs, public projection, hidden/expired/moderation gates, rate limits and blocks. Utility tests reject external/lookalike report links and preserve unconfirmed-reunion labels. Hosted anonymous RPC: safe match read200/[], mutation401 permission denied, public contact-column read200/[].

Local mobile fixture320/390px no horizontal overflow. Mark-match remains possible until the other report confirms; rule-out and reset work. Switching to reunited hides contact fields; switching back resets them. No production form submission performed. Fixture screenshot is labeled test data; temporary route removed before final build.

Supabase changelog checked November6: Flutter v3 and CLI v3 breaking changes do not change this existing JS/RPC release. RLS guidance reviewed. TypeScript/OpenNext checks and native/live deployment acceptance are recorded below once complete.

## Remaining

Real reporter account acceptance and independently reported lost/found case pilot remain open because production has no reporter-linked cases. Matching is manual, not automatic AI/photo identity matching. Dispute/report-abuse refinements remain future work. Broader FB coverage remains incomplete. Mountain House and Manteca2026 photo tasks remain open; current targeted search found only older/reused or unlicensed images. Lathrop and Tracy’s accepted photos remain published.
