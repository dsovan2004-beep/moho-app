# MoHoLocal active execution queue

Updated November 5, 2026. Acceptance criteria and task status live in [ROADMAP.md](ROADMAP.md); sprint outcomes live in [SPRINTS.md](SPRINTS.md). Keep all three aligned when work changes. This is the next-work queue, not a second source of truth.

Completed **SEC-07 — P0 credential retirement:** modern-key deployments are live; legacy apikeys are disabled and the previous HS256 verifier revoked. Database, Auth-admin and Storage reject the old credential with HTTP 401; modern server and signed-in requester checks pass.

Completed **OPS-02 — delivery:** both Workers passed clean native Git builds from main; temporary setup permission removed and build-token registry access now returns 403. Watch paths exclude documentation-only changes; legacy Pages automatic builds are disabled.

1. **DATA-01 / DATA-02 — verified supply:** 39-record desk pass completed: 3 corrected, 36 unresolved/mismatched (20 additional public records held). Twelve individually curated additions include four landscapers. 23 website-checked listings total. Mountain House: landscaping 4, handyman 3, cleaning 3, plumbing 3; Tracy: landscaping 4, handyman 3, cleaning 4, plumbing 4. Owner confirmations and greater choice remain open.
2. **PRIV-01 — release policy:** Privacy and Terms deployed with accurate account/content/message boundaries, retention limits and operator contact. Live pages, footer contacts and both native builds verified; no legal-certification claim.
3. **UX-01 / UX-02 / DATA-03 — experience:** city/task search, service-area evidence, catalog error handling, mobile navigation and full-width evidence/contact cards are deployed. Live 320px/390px, skip/Escape and 44px contact checks pass. Continue resident usability tests, remaining Best Of/SEO surfaces and empty searches using real inventory.
4. **PET-01 — useful community loop:** reporter-only status confirmation and archive/restore deployed; automatic expiry, privacy-safe photos/contact, and imported report source audit remain open. Recent/history UI and moderated intake are implemented. Eleven unsourced old reunion stories are now held for provenance review, with all records preserved.
5. **SEO-01 — release hygiene:** bare-domain www redirect confirmed in browser; sitemap/structured-data accuracy, private indexing and legacy route review remain open.
6. **PILOT-01 / METRIC-01 — validation:** meet checked-provider coverage, observe real searches/contact outcomes, then decide expansion/monetization. No outreach is authorized yet.

Shared regional experience: Mountain House, Tracy, Lathrop and Manteca. Initial deeper business verification remains Mountain House and Tracy. A Facebook research lead or an old approved flag is not independent verification.

November 5 UX follow-up: mobile navigation now has visible 48px touch targets, Escape/focus handling and a skip link; city/category evidence and discovery count errors are corrected. TypeScript, clean native build and live interactions pass; revised navigation and mobile results are deployed. Design acceptance criteria: `docs/ux/design-standard.md`. No competitor-superiority or resident-validation claim is made.

November 5 scope update: resident discussion threads on pet reports (PET-02) and private report-linked DMs (MSG-01) are authorized. Both require confirmed-account identity, durable spam limits, reporting/moderation; DMs additionally require participant-only access and blocking. Implemented and deployed: report discussions, private inbox, participant RLS, blocking and reported-message-only moderation. 49 local regression tests and both native builds pass. Live anonymous gates, signed-in empty inbox, admin queue and 320px/390px checks pass. No production test posts or DMs sent.

November 5 continuation in progress: MSG-02 adds persistent unread notifications and optional privacy-safe browser alerts while the site is visible. PET-01 adds reporter-only status confirmation, reunion/archive/restore with revision checks and private history. Five additional source-checked providers published; 23 checked listings total. Coverage per focus city is now at least 3 providers in each launch category. Migration 20261106014512 and web deployed; native build, signed-in unread controls and account-scoped management acceptance pass. Local tests: 55 pass; OpenNext and TypeScript checks pass. Closed-app push/email remain separate follow-ups.

November 5 footer cleanup requested from screenshot: replace multicolored city chips with four consistent, readable 44px community links using the relaunch-city configuration; update service-area wording. Other existing city records/URLs retained. Deployed and verified desktop/mobile. Additional QA found the full navigation overflowing at 888px; compact navigation breakpoint is being corrected.

Final lifecycle UX review: archiving from a public report now returns the reporter to My pet reports, where restore is available, rather than reloading a hidden report into a 404. Status authorization and moderation rules are unchanged; final deployment check pending.
