# MoHoLocal — Operations Guide

Updated November 6, 2026. This guide replaces the March 2026 operating model. The founder has authorized autonomous relaunch engineering, source-checked listing curation, release work and planning upkeep in the current session. User instructions take precedence over historical documentation.

## Responsibilities

| Role | Ownership |
| --- | --- |
| Product and technical lead | Prioritize resident needs, architecture, secure implementation and reviewable releases; keep Next.js, Supabase and Cloudflare |
| UX/UI lead | Clear city/task discovery, mobile and keyboard access, honest loading/empty/error states, consistent contact choices |
| Market and provider researcher | Compare local alternatives, find missing supply, deduplicate candidates, check primary sources and record limitations |
| Local business openings researcher | Check openings, closures and significant retail/service changes across Mountain House, Tracy, Lathrop and Manteca |
| Community updates editor | Turn verified local changes and seasonal events into concise dated updates with useful links; distinguish planned, opening and operating status |
| Data and photo-rights editor | Preserve evidence and correction history; verify service areas separately from office locations; establish actual capture year, location, author and existing reuse rights before publishing photography |
| Release and operations lead | Run relevant checks, verify native deployments and live behavior, maintain backlog, roadmap, sprint and release evidence |

The new local openings and community editor responsibilities were explicitly requested November 6. They apply during autonomous work sessions; they do not establish a recurring background job or authorize messaging people.

## Editorial rules

- Prefer current business/operator pages, City records and official organizer announcements. Keep source URLs and the check date.
- A proposed tenant or hiring ad is not an operating store. Do not guess a grand-opening date. Past openings must not appear as future events.
- Remove expired opening-weekend discounts and giveaways. Link to current hours instead of promising live availability.
- Publish local updates under their actual city. A regional provider’s service area does not establish its office location.
- A website information check does not verify credentials, insurance, workmanship, reviews, prices or availability. Keep that scope visible.
- Review featured local-opening updates monthly; hide them after their review window if they have not been refreshed. Do not call every business permanently “new.”
- No outreach or permission requests: the user has prohibited messages. Public social visibility alone is not permission to reuse photographs.
- Mountain House’s real 2026 street-photo task remains open. Retain the dated satellite view until an exact-location image with capture-date and existing reuse-rights evidence qualifies. Tracy’s accepted licensed photo remains usable with its credits.

## Engineering and release

Use the existing Next.js / OpenNext Cloudflare Worker / Supabase stack. Current application runtime is `nodejs`; the old Pages edge-only rule is obsolete. Public business queries require both approved status and the existing public verification gate. Use the shared client inside functions; preserve private data boundaries and RLS.

Read current files before edits. Run relevant regression tests, TypeScript and the OpenNext build for application changes. Push reviewed work to the configured Git remote, let native Cloudflare Builds deploy, then verify production behavior. Documentation-only changes are excluded from the native build watch paths. Never treat a push or queued build as successful deployment.

Keep secrets out of files, logs and URLs. Use configured credential helpers and scoped connectors; never embed a token in a Git remote. Do not bulk-publish imported seed records. Individually curated additions require duplicate checks, primary-source evidence, scoped listing checks and private correction history, followed by read-back. Schema/security changes need their applicable migration and verification workflow.

The founder retains business pricing/spend decisions and approvals that specifically require owner action. Autonomous work does not authorize financial commitments, new access grants or unsolicited communications.

## Planning and acceptance

[BACKLOG.md](BACKLOG.md) is the next-work queue; [ROADMAP.md](ROADMAP.md) holds acceptance/status; [SPRINTS.md](SPRINTS.md) records outcomes. Update all three when scope or acceptance changes. Separate implemented, tested, deployed and live-accepted states.

Next deeper listing verification remains Mountain House and Tracy. Local updates may cover all four relaunch cities. Resident usability validation, owner confirmations, physical phone push testing, legacy discovery/SEO review and the Mountain House street-photo gap remain explicit until evidence closes them.
