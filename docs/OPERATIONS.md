# MoHoLocal — Operations Guide

Updated November 9, 2026. This guide replaces the March 2026 operating model. The founder has authorized autonomous relaunch engineering, source-checked listing curation, release work and planning upkeep in the current session. User instructions take precedence over historical documentation.

## Product direction: a living local directory

November9founder alignment: residents already use and enjoy Facebook groups. Make MoHoLocal the useful continuing reference for local help: explicit service areas, direct contact actions, source/check dates, current events and openings, persistent pet progress, and moderated corrections. Make useful records easy to share voluntarily. Success is finding help and keeping information current, not requiring residents to abandon existing groups or maximizing post counts. Facebook drafts remain unpublished; no outreach or automated posting is authorized.

Founder direction, November 6: MoHoLocal is a living directory for locals. Maintain useful services, places/openings, events, discussions and pet updates as connected local information, with clear dates and correction paths. More records should produce better city/service coverage and useful actions, rather than unsupported quality claims. Expansion now includes services and events across all four relaunch cities, with rights-checked service/event imagery. Prioritize gaps and freshness; measure successful contacts, useful replies, event-detail/calendar actions, corrections and resolved reports. Unattended research is now explicitly authorized through FRESH-01; messaging remains prohibited.

## Execution mandate — November 9

This chat is the MoHoLocal implementation owner for Mountain House, Tracy, Lathrop and Manteca. The roles below remain active as one accountable team, not separate chats. Keep the Next.js/Cloudflare/Supabase stack. Lead product decisions and finish reviewable increments autonomously.

Prioritize resident-facing improvements over repeated status passes. Choose one concrete build outcome, implement it, test the affected journey, deploy and verify it, then update plans once with accepted evidence. Provider/event curation and imagery research continue as supporting work. Do not turn unchanged Search Console processing, a healthy deployment or unchanged photo/pet-pilot gates into repeated work. Check those at meaningful intervals or when a new release/evidence requires it.

Engineering, UX, editorial freshness, security/privacy, community/pet operations, growth/SEO, monetization strategy, analytics and release delivery all remain owned here. Basic listings remain free for initial validation; no paid activation or willingness-to-pay claims without validation. Facebook drafts stay unpublished; no outreach or photo-permission requests. Keep photo-location/rights, genuine-reporter pilot and physical-phone acceptance open until their actual criteria pass.

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
| Growth, Community Marketing & Monetization Lead | Local SEO, city-specific content, Facebook draft campaigns, community-rule checks, business participation proposals, willingness-to-pay research, revenue experiments, pricing proposals and honest outcome measurement. Research and drafts authorized; do not post, send, contact admins, schedule social posts or spend without explicit authorization. |
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

## Facebook resident-needs research — November6 scope addition

FB-01 remains active. During manual and twice-weekly refresh work, continue the private group/post coverage ledger before starting duplicate research. Review accessible local groups across all4cities, starting latest30days; read each selected post fully, inspect relevant image text and all available comments/nested replies, checking outcome rather than counting engagement as demand. Mark partial comments or inaccessible groups explicitly; never label all groups/posts reviewed without completion evidence. Separate requests, offers/promotions, updates and out-of-area content. Deduplicate crossposts and normalize dates. Keep exact per-post references and resident details outsideGit/publicdata. Publish only anonymized observations and independently website-checked listing/event facts. No joins, messages, reactions, new permissions or photo reuse without existing rights. Prioritize unfinished threads and unreviewed groups from private ledger; scope is ongoing, not a one-screen survey.

## Growth, Community Marketing & Monetization Lead — added November 8, 2026

The user explicitly added this role and authorized local SEO work plus Facebook drafts for Mountain House, Tracy, Lathrop and Manteca. All social posts, outreach, permission requests and paid promotion remain unsent/unpublished. Do not invent group memberships, admin approval or endorsements. Check each group's current promotional/link rules before any future authorized distribution. Clearly disclose the founder/project relationship; avoid fake resident testimonials, guaranteed rankings, blanket verified-business claims and unconfirmed holiday availability. Existing photo rights rules apply to all marketing assets.

Measure search visibility, useful clicks and optional resident outcomes separately. Search Console canonical URL-prefix ownership and sitemap acceptance are verified as of November8: Google read1,102URLs successfully and all four city landing pages report indexed. Performance and index-coverage baselines remain processing; no ranking or traffic uplift claims without evidence. Retain the Google verification HTML asset; details in marketing/search-console-2026-11-08.md. Do not create a Google Business Profile pretending the directory is a local storefront. Use substantive city pages and actual inventory, avoiding doorway pages or mass near-duplicate content. Current campaign drafts and SEO audit live in docs/marketing/.


## Monetization ownership — added November 8, 2026

Own the revenue strategy and economics as well as acquisition: evaluate paid enhancements, explicitly labeled sponsorships and advertising, business retention, operating costs and resident value. Basic resident browsing and basic listings should remain free for the initial validation. Payment must never purchase verification, an undisclosed recommendation or a misleading ranking. Research and draft proposals are authorized; no outreach, billing activation, charges, ad purchases, commercial commitments or public price promises without explicit authorization. Validate willingness to pay before building paid features. No revenue forecast is established by current traffic or the number of listings. MON-01 in the backlog defines acceptance.

Deployment provenance: npm run cf:build emits public/build-info.json from Git HEAD before bundling. Verify its source_revision against the intended application commit during release acceptance. This endpoint contains only the public app name and commit hash; never add environment or account data. Native trigger dispatch recovery (Nov8): existing Disable builds setting saved on then off restored dispatch for45ae8b1; no credential/permission expansion. CLI currently has Pages-only OAuth and cannot deploy moho-web.
