# MoHoLocal — Operations Guide

Updated November 6, 2026. This guide replaces the March 2026 operating model. The founder has authorized autonomous relaunch engineering, source-checked listing curation, release work and planning upkeep in the current session. User instructions take precedence over historical documentation.

## Product direction: a living local directory

Founder direction, November 6: MoHoLocal is a living directory for locals. Maintain useful services, places/openings, events, discussions and pet updates as connected local information, with clear dates and correction paths. More records should produce better city/service coverage and useful actions, rather than unsupported quality claims. Expansion now includes services and events across all four relaunch cities, with rights-checked service/event imagery. Prioritize gaps and freshness; measure successful contacts, useful replies, event-detail/calendar actions, corrections and resolved reports. Unattended research is now explicitly authorized through FRESH-01; messaging remains prohibited.

## Responsibilities

| Role | Ownership |
| --- | --- |
| Product lead | Living-directory vision, resident needs, priorities and useful local actions |
| CTO / architect | Maintain Next.js, Cloudflare and Supabase; sound architecture, reliability and proportionate complexity |
| Full-stack engineer | Application code, database integrations and implementation |
| UX/UI lead | Visual design, mobile usability, accessibility, clear navigation and contact flows |
| Market researcher | Local problems, competitor gaps and Facebook-group research with source limitations |
| Provider researcher | Check business identity, public contacts, exact services, service areas and primary sources |
| Local openings researcher | Track openings, closures and significant business changes; distinguish planned from operating |
| Events editor | Check organizer, dates, venues, eligibility, changing details and expiry |
| Photo / visual editor | Relevant imagery, exact-location/capture context where required, existing reuse rights and credits |
| Community experience lead | Useful discussions, private messaging, pet updates, notifications and moderation workflows |
| Growth / SEO lead | Local discovery, search visibility and return visits; no outreach without authorization |
| Data quality editor | Duplicates, stale records, corrections, provenance and city/category coverage gaps |
| Security / privacy lead | Access controls, private-data boundaries and safe submission/claim/community workflows |
| QA / release lead | Meaningful tests, builds, deployment verification and real live checks |
| Delivery / operations lead | Backlog, roadmap, sprint, recurring freshness workflow, refresh ledger and release evidence |
| Analytics / business strategy lead | Useful contacts, replies, event/calendar actions, corrections, resolved reports and sustainable growth |


The new local openings and community editor responsibilities were explicitly requested November 6. A November 6 request separately authorized FRESH-01, the active Tuesday/Friday 9 AM Pacific refresh in this chat. Messaging people remains prohibited.

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

Continue deeper Mountain House/Tracy verification and extend service/category and event coverage to Lathrop/Manteca, as requested November 6. Resident usability validation, owner confirmations, physical phone push testing, legacy discovery/SEO review and the Mountain House street-photo gap remain explicit until evidence closes them.


## Twice-weekly freshness cycle

FRESH-01 is active as `moholocal-twice-weekly-freshness-refresh`, Tuesdays and Fridays at 9 AM America/Los_Angeles, attached to this chat. Next scheduled run after setup is November 10, 2026. Each run reads current planning, researches current primary sources, checks stale event/opening details and useful service gaps, continues rights-cleared imagery sourcing, and publishes justified changes through existing evidence/release gates. Record the completed period in [REFRESH_LOG.md](REFRESH_LOG.md) to avoid duplicates. Stay quiet on unchanged non-actionable state; report meaningful updates, failures or precise owner-only blockers. No outreach, purchases or new access grants. This explicit instruction supersedes historical no-recurring-job notes.
